import { prisma } from './db';

export const financeService = {
  getExpenses: async (startDate?: Date, endDate?: Date) => {
    return prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { date: 'desc' }
    });
  },

  createExpense: async (data: { category: string; amount: number; paymentMethod: string; description: string; receiptUrl?: string; createdBy?: string; date?: Date }) => {
    return prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          category: data.category,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: data.description,
          receiptUrl: data.receiptUrl,
          createdBy: data.createdBy,
          date: data.date || new Date()
        }
      });

      await tx.cashbook.create({
        data: {
          type: 'OUT',
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: `Chi phí: ${data.description}`,
          referenceType: 'EXPENSE',
          referenceId: expense.id,
          date: expense.date
        }
      });

      return expense;
    });
  },

  cancelExpense: async (id: string, reason: string, userId?: string) => {
    return prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Cancel cashbook entry
      await tx.cashbook.updateMany({
        where: { referenceType: 'EXPENSE', referenceId: id },
        data: { status: 'CANCELLED' }
      });

      await tx.auditLog.create({
        data: {
          action: 'CANCEL_EXPENSE',
          userId,
          details: `Hủy khoản chi ${id}. Lý do: ${reason}`
        }
      });

      return expense;
    });
  },

  getRevenues: async (startDate?: Date, endDate?: Date) => {
    return prisma.revenue.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { date: 'desc' }
    });
  },

  createRevenue: async (data: { source: string; amount: number; paymentMethod: string; description: string; receiptUrl?: string; createdBy?: string; date?: Date }) => {
    return prisma.$transaction(async (tx) => {
      const revenue = await tx.revenue.create({
        data: {
          source: data.source,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: data.description,
          receiptUrl: data.receiptUrl,
          createdBy: data.createdBy,
          date: data.date || new Date()
        }
      });

      await tx.cashbook.create({
        data: {
          type: 'IN',
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: `Thu khác: ${data.description}`,
          referenceType: 'REVENUE',
          referenceId: revenue.id,
          date: revenue.date
        }
      });

      return revenue;
    });
  },

  cancelRevenue: async (id: string, reason: string, userId?: string) => {
    return prisma.$transaction(async (tx) => {
      const revenue = await tx.revenue.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await tx.cashbook.updateMany({
        where: { referenceType: 'REVENUE', referenceId: id },
        data: { status: 'CANCELLED' }
      });

      await tx.auditLog.create({
        data: {
          action: 'CANCEL_REVENUE',
          userId,
          details: `Hủy khoản thu khác ${id}. Lý do: ${reason}`
        }
      });

      return revenue;
    });
  }
};
