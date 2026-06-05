import { prisma } from './db';

export const cashbookService = {
  getTransactions: async (startDate?: Date, endDate?: Date) => {
    return prisma.cashbook.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { date: 'desc' }
    });
  },

  getBalances: async () => {
    const activeTransactions = await prisma.cashbook.findMany({
      where: { status: 'ACTIVE' }
    });

    const balances: Record<string, number> = {
      'CASH': 0,
      'BANK': 0,
      'CARD': 0,
      'E_WALLET': 0
    };

    let total = 0;

    activeTransactions.forEach(t => {
      const amount = t.type === 'IN' ? t.amount : -t.amount;
      if (balances[t.paymentMethod] !== undefined) {
        balances[t.paymentMethod] += amount;
      } else {
        balances[t.paymentMethod] = amount; // fallback for unhandled methods
      }
      total += amount;
    });

    return { balances, total };
  }
};
