import { prisma } from './db';

export const orderService = {
  getOpenOrderByTable: async (diningTableId: string) => {
    return prisma.order.findFirst({
      where: { diningTableId, status: 'OPEN' },
      include: { items: { where: { status: { not: 'CANCELLED' } } } }
    });
  },

  createOrder: async (data: any) => {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          diningTableId: data.diningTableId,
          totalAmount: data.totalAmount,
          discount: data.discount,
          surcharge: data.surcharge,
          vat: data.vat,
          note: data.note,
          items: {
            create: data.items.map((item: any) => ({
              itemName: item.itemName,
              categoryName: item.categoryName,
              quantity: item.quantity,
              price: item.price,
              cost: item.cost || 0,
              note: item.note,
            }))
          }
        },
        include: { items: true }
      });
      if (data.diningTableId) {
        await tx.diningTable.update({
          where: { id: data.diningTableId },
          data: { status: 'OCCUPIED' }
        });
      }
      return order;
    });
  },

  updateOrder: async (id: string, data: any) => {
    return prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        if (item.id) {
          // Update existing
          await tx.orderItem.update({
            where: { id: item.id },
            data: { quantity: item.quantity, note: item.note }
          });
        } else {
          // Create new
          await tx.orderItem.create({
            data: {
              orderId: id,
              itemName: item.itemName,
              categoryName: item.categoryName,
              quantity: item.quantity,
              price: item.price,
              cost: item.cost || 0,
              note: item.note,
            }
          });
        }
      }

      // Find any items that were in the DB but are not in data.items (deleted in POS without calling cancel)
      // For strict compliance, POS should call cancelItem API. Here we just gracefully soft-delete them if they disappear.
      const existingItems = await tx.orderItem.findMany({ where: { orderId: id, status: { not: 'CANCELLED' } } });
      const incomingIds = data.items.filter((i: any) => i.id).map((i: any) => i.id);
      for (const ex of existingItems) {
        if (!incomingIds.includes(ex.id)) {
          await tx.orderItem.update({
            where: { id: ex.id },
            data: { status: 'CANCELLED', note: 'Xóa từ POS' }
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          totalAmount: data.totalAmount,
          discount: data.discount,
          surcharge: data.surcharge,
          vat: data.vat,
          note: data.note,
        },
        include: { items: { where: { status: { not: 'CANCELLED' } } } }
      });
    });
  },

  cancelOrderItem: async (id: string, reason: string, userId: string) => {
    return prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.update({
        where: { id },
        data: { status: 'CANCELLED', note: reason },
        include: { order: true }
      });
      await tx.auditLog.create({
        data: {
          action: 'CANCEL_ITEM',
          userId,
          details: `Hủy món ${item.itemName} x${item.quantity}. Lý do: ${reason}`
        }
      });
      return item;
    });
  },

  transferTable: async (orderId: string, newTableId: string, userId: string) => {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");
      
      const oldTableId = order.diningTableId;

      await tx.order.update({
        where: { id: orderId },
        data: { diningTableId: newTableId }
      });

      if (oldTableId) {
        // check if old table has other open orders
        const otherOrders = await tx.order.count({ where: { diningTableId: oldTableId, status: 'OPEN' } });
        if (otherOrders === 0) {
          await tx.diningTable.update({ where: { id: oldTableId }, data: { status: 'AVAILABLE' } });
        }
      }

      await tx.diningTable.update({ where: { id: newTableId }, data: { status: 'OCCUPIED' } });

      await tx.auditLog.create({
        data: {
          action: 'TRANSFER_TABLE',
          userId,
          details: `Chuyển order ${orderId} sang bàn mới ${newTableId}`
        }
      });
    });
  },

  getOrders: async () => {
    return prisma.order.findMany({ include: { items: true, diningTable: true }, orderBy: { createdAt: 'desc' } });
  }
};
