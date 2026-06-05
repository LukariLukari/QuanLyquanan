import { prisma } from './db';

export const reservationService = {
  getAll: async (start?: Date, end?: Date) => {
    const where: any = {};
    if (start && end) {
      where.time = { gte: start, lte: end };
    }
    return prisma.reservation.findMany({
      where,
      include: { diningTable: true },
      orderBy: { time: 'asc' }
    });
  },

  create: async (data: any) => {
    return prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        partySize: data.partySize || 1,
        time: new Date(data.time),
        diningTableId: data.diningTableId,
        deposit: data.deposit || 0,
        note: data.note,
        status: 'PENDING'
      },
      include: { diningTable: true }
    });
  },

  updateStatus: async (id: string, status: string) => {
    return prisma.$transaction(async (tx) => {
      const res = await tx.reservation.update({
        where: { id },
        data: { status },
        include: { diningTable: true }
      });

      if (status === 'CONFIRMED' && res.diningTableId) {
        await tx.diningTable.update({
          where: { id: res.diningTableId },
          data: { status: 'RESERVED' }
        });
      } else if (['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(status) && res.diningTableId) {
        // check if table is still reserved
        const table = await tx.diningTable.findUnique({ where: { id: res.diningTableId }});
        if (table?.status === 'RESERVED') {
          await tx.diningTable.update({
            where: { id: res.diningTableId },
            data: { status: 'AVAILABLE' }
          });
        }
      }

      return res;
    });
  }
};
