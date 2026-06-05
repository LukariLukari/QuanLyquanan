import { prisma } from './db';

export const payrollService = {
  getPayrolls: async (month: string) => { // month format 'YYYY-MM'
    return prisma.payroll.findMany({
      where: { month },
      include: { user: true }
    });
  },

  calculatePayroll: async (month: string, userId: string) => {
    // 1. Get User info
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Không tìm thấy nhân viên');

    // 2. Parse month range
    const [year, m] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);

    // 3. Get Attendances
    const attendances = await prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      }
    });

    let totalDays = 0;
    let totalHours = 0;
    let overtimeHours = 0;

    attendances.forEach(a => {
      totalHours += a.totalHours || 0;
      overtimeHours += a.overtimeHours || 0;
      if (a.shift === 'FULLDAY') totalDays += 1;
      else totalDays += 0.5; // Half shift
    });

    // 4. Calculate Salary
    // If baseSalary > 0, assume monthly salary, calculate ratio based on 26 days a month? 
    // Or simpler: baseSalary + (totalHours * hourlyRate)
    // To make it flexible:
    const calculatedSalary = user.baseSalary + (totalHours * user.hourlyRate);
    const overtimeSalary = overtimeHours * user.hourlyRate * 1.5; // Example 1.5x for OT
    
    const netSalary = calculatedSalary + overtimeSalary + user.allowance;

    // 5. Upsert Payroll
    return prisma.payroll.upsert({
      where: { userId_month: { userId, month } },
      update: {
        totalDays,
        totalHours,
        baseSalary: user.baseSalary,
        calculatedSalary,
        overtimeSalary,
        allowance: user.allowance,
        netSalary // Net Salary before bonus/deductions (which can be edited manually later)
      },
      create: {
        userId,
        month,
        totalDays,
        totalHours,
        baseSalary: user.baseSalary,
        calculatedSalary,
        overtimeSalary,
        allowance: user.allowance,
        netSalary
      }
    });
  },

  updatePayrollManually: async (id: string, data: any) => {
    const netSalary = (data.calculatedSalary || 0) + (data.overtimeSalary || 0) + (data.allowance || 0) + (data.bonus || 0) - (data.deduction || 0) - (data.advance || 0);
    return prisma.payroll.update({
      where: { id },
      data: { ...data, netSalary }
    });
  },

  lockPayroll: async (id: string, userId: string) => {
    return prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.update({
        where: { id },
        data: { status: 'LOCKED' },
        include: { user: true }
      });

      // Tạo phiếu chi cho Lương
      const expense = await tx.expense.create({
        data: {
          category: 'Lương',
          amount: payroll.netSalary,
          paymentMethod: 'CASH',
          description: `Trả lương tháng ${payroll.month} cho nhân viên ${payroll.user.name}`,
          createdBy: userId
        }
      });

      // Ghi Sổ quỹ
      await tx.cashbook.create({
        data: {
          type: 'OUT',
          amount: payroll.netSalary,
          paymentMethod: 'CASH',
          description: `Chi lương tháng ${payroll.month} - ${payroll.user.name}`,
          referenceType: 'EXPENSE',
          referenceId: expense.id,
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'LOCK_PAYROLL',
          userId,
          details: `Chốt lương tháng ${payroll.month} cho ${payroll.user.name}. Tổng: ${payroll.netSalary}`
        }
      });

      return payroll;
    });
  }
};
