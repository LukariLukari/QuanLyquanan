import { prisma } from './db';
import { reportService } from './reportService';
import { cashbookService } from './cashbookService';

export const settingService = {
  getSettings: async () => {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  },
  updateSetting: async (key: string, value: string) => {
    return prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  },
  getDashboardStats: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const invoicesToday = await prisma.invoice.count({
      where: { createdAt: { gte: today, lte: endOfDay } }
    });

    const activeTables = await prisma.diningTable.count({
      where: { status: 'OCCUPIED' }
    });

    const pendingOrders = await prisma.order.count({
      where: { status: 'OPEN' }
    });

    const pnlToday = await reportService.getProfitAndLossReport(today, endOfDay);
    const cashbook = await cashbookService.getBalances();

    return {
      revenueToday: pnlToday.sales.totalRevenue,
      expensesToday: pnlToday.expenses.total,
      grossProfitToday: pnlToday.sales.grossProfit,
      netIncomeToday: pnlToday.netIncome,
      invoicesToday,
      activeTables,
      pendingOrders,
      cashBalance: cashbook.balances['CASH'] || 0,
      bankBalance: (cashbook.balances['BANK_TRANSFER'] || 0) + (cashbook.balances['BANK'] || 0)
    };
  }
};
