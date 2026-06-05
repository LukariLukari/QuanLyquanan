import { prisma } from './db';

export const paymentService = {
  processPayment: async (data: { orderId: string; amount: number; method: string; tableId: string; nextTableStatus: string }) => {
    return prisma.$transaction(async (tx) => {
      // 1. Create Payment
      await tx.payment.create({
        data: {
          orderId: data.orderId,
          amount: data.amount,
          method: data.method,
        }
      });

      // 2. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          orderId: data.orderId,
          total: data.amount,
        }
      });

      // 3. Update Order Status
      await tx.order.update({
        where: { id: data.orderId },
        data: { status: 'PAID' }
      });

      // 4. Update Table Status
      await tx.diningTable.update({
        where: { id: data.tableId },
        data: { status: data.nextTableStatus }
      });

      // 5. Ghi nhận vào sổ quỹ (Cashbook)
      await tx.cashbook.create({
        data: {
          type: 'IN',
          amount: data.amount,
          paymentMethod: data.method,
          description: `Thanh toán hóa đơn #${data.orderId.slice(-6).toUpperCase()}`,
          referenceType: 'ORDER',
          referenceId: data.orderId,
        }
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PAYMENT',
          details: `Thanh toán hóa đơn ${invoice.id} số tiền ${data.amount}`,
        }
      });

      return invoice;
    });
  },
  getInvoices: async () => {
    return prisma.invoice.findMany({
      include: {
        order: {
          include: { items: true, diningTable: true, payments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
