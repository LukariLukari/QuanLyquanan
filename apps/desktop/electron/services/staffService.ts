import { prisma } from './db';
import { hashPassword } from './authService';

export const staffService = {
  getStaffs: async () => {
    return prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  getRoles: async () => {
    return prisma.role.findMany();
  },

  createStaff: async (data: any) => {
    return prisma.user.create({
      data: {
        code: data.code,
        username: data.username,
        password: hashPassword(data.password),
        name: data.name,
        phone: data.phone,
        email: data.email,
        roleId: data.roleId,
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
        baseSalary: data.baseSalary || 0,
        hourlyRate: data.hourlyRate || 0,
        allowance: data.allowance || 0,
        status: data.status || 'ACTIVE',
        note: data.note,
      }
    });
  },

  updateStaff: async (id: string, data: any) => {
    const updateData: any = {
      code: data.code,
      username: data.username,
      name: data.name,
      phone: data.phone,
      email: data.email,
      roleId: data.roleId,
      joinDate: data.joinDate ? new Date(data.joinDate) : null,
      baseSalary: data.baseSalary,
      hourlyRate: data.hourlyRate,
      allowance: data.allowance,
      status: data.status,
      note: data.note,
    };
    if (data.password) {
      updateData.password = hashPassword(data.password);
    }
    return prisma.user.update({
      where: { id },
      data: updateData
    });
  },

  deleteStaff: async (id: string) => {
    // Soft delete or status update
    return prisma.user.update({
      where: { id },
      data: { status: 'LEFT' }
    });
  }
};
