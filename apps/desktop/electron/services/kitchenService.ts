import { prisma } from './db';

export const kitchenService = {
  getPendingItems: async () => {
    return prisma.orderItem.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING'] },
        order: { status: 'OPEN' }
      },
      include: {
        order: {
          include: {
            diningTable: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  },

  updateItemStatus: async (id: string, status: string) => {
    return prisma.orderItem.update({
      where: { id },
      data: { status }
    });
  }
};
