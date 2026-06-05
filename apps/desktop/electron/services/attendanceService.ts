import { prisma } from './db';

export const attendanceService = {
  getAttendances: async (startDate: Date, endDate: Date) => {
    return prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      include: { user: true },
      orderBy: { date: 'desc' }
    });
  },

  checkIn: async (userId: string, shift: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Check if already checked in today for this shift
    const existing = await prisma.attendance.findFirst({
      where: { userId, date: today, shift }
    });

    if (existing) {
      throw new Error('Đã chấm công ca này rồi.');
    }

    return prisma.attendance.create({
      data: {
        userId,
        date: today,
        shift,
        checkIn: new Date(),
        status: 'PENDING'
      }
    });
  },

  checkOut: async (id: string, note?: string) => {
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    if (!attendance || !attendance.checkIn) throw new Error('Không tìm thấy giờ vào.');

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - attendance.checkIn.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    return prisma.attendance.update({
      where: { id },
      data: {
        checkOut: checkOutTime,
        totalHours: parseFloat(totalHours.toFixed(2)),
        status: 'COMPLETED',
        note
      }
    });
  },

  updateAttendance: async (id: string, data: any) => {
    return prisma.attendance.update({
      where: { id },
      data
    });
  }
};
