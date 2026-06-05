import { prisma } from './db';

export const reportService = {
  getSalesReport: async (startDate: Date, endDate: Date) => {
    // We only consider PAID orders for sales report
    const orders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        items: true,
        payments: true
      }
    });

    let totalRevenue = 0; // Gross Revenue (Tổng tiền món - Giảm giá + Phụ thu + VAT)
    let totalDiscount = 0;
    let totalSurcharge = 0;
    let totalVAT = 0;
    let totalCost = 0;

    const paymentMethods: Record<string, number> = {};
    const categorySales: Record<string, number> = {};
    const itemSales: Record<string, { quantity: number; revenue: number }> = {};

    for (const order of orders) {
      totalDiscount += order.discount;
      totalSurcharge += order.surcharge;
      totalVAT += order.vat;
      
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderRevenue = subtotal - order.discount + order.surcharge + (subtotal * order.vat / 100);
      totalRevenue += orderRevenue;

      for (const item of order.items) {
        totalCost += item.cost * item.quantity;
        
        // Item breakdown
        if (!itemSales[item.itemName]) {
          itemSales[item.itemName] = { quantity: 0, revenue: 0 };
        }
        itemSales[item.itemName].quantity += item.quantity;
        itemSales[item.itemName].revenue += item.price * item.quantity; // Gross price
      }

      for (const payment of order.payments) {
        if (!paymentMethods[payment.method]) paymentMethods[payment.method] = 0;
        paymentMethods[payment.method] += payment.amount;
      }
    }

    const netProfit = totalRevenue - totalCost;

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalCost,
      grossProfit: netProfit, // Lãi gộp (Gross Margin) = Revenue - COGS
      totalDiscount,
      totalSurcharge,
      totalVAT,
      paymentMethods,
      itemSales,
    };
  },

  getProfitAndLossReport: async (startDate: Date, endDate: Date) => {
    const sales = await reportService.getSalesReport(startDate, endDate);
    
    // Get active expenses
    const expenses = await prisma.expense.findMany({
      where: {
        status: 'ACTIVE',
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    let totalExpenses = 0;
    const expenseBreakdown: Record<string, number> = {};

    for (const exp of expenses) {
      totalExpenses += exp.amount;
      if (!expenseBreakdown[exp.category]) expenseBreakdown[exp.category] = 0;
      expenseBreakdown[exp.category] += exp.amount;
    }

    // Get active other revenues
    const revenues = await prisma.revenue.findMany({
      where: {
        status: 'ACTIVE',
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    let totalOtherRevenue = 0;
    for (const rev of revenues) {
      totalOtherRevenue += rev.amount;
    }

    const netIncome = sales.grossProfit + totalOtherRevenue - totalExpenses; // Lãi/lỗ thuần

    return {
      sales,
      expenses: {
        total: totalExpenses,
        breakdown: expenseBreakdown
      },
      otherRevenue: totalOtherRevenue,
      netIncome
    };
  }
};
