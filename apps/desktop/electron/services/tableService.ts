import { prisma } from './db';

export const tableService = {
  getAreas: async () => {
    return prisma.area.findMany({ include: { tables: true } });
  },
  createArea: async (name: string) => {
    return prisma.area.create({ data: { name } });
  },
  updateArea: async (id: string, name: string) => {
    return prisma.area.update({ where: { id }, data: { name } });
  },
  deleteArea: async (id: string) => {
    return prisma.area.delete({ where: { id } });
  },
  getTables: async () => {
    return prisma.diningTable.findMany({ include: { area: true } });
  },
  createTable: async (data: { name: string; areaId: string; capacity?: number }) => {
    return prisma.diningTable.create({ data });
  },
  updateTable: async (id: string, data: { name?: string; areaId?: string; capacity?: number; status?: string }) => {
    return prisma.diningTable.update({ where: { id }, data });
  },
  deleteTable: async (id: string) => {
    return prisma.diningTable.delete({ where: { id } });
  },
  updateTableStatus: async (id: string, status: string) => {
    return prisma.diningTable.update({ where: { id }, data: { status } });
  }
};
