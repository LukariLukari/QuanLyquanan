import { prisma } from './db';

export const menuService = {
  getCategories: async () => {
    return prisma.category.findMany();
  },
  createCategory: async (name: string) => {
    return prisma.category.create({ data: { name } });
  },
  updateCategory: async (id: string, name: string) => {
    return prisma.category.update({ where: { id }, data: { name } });
  },
  deleteCategory: async (id: string) => {
    return prisma.category.delete({ where: { id } });
  },
  getMenuItems: async () => {
    return prisma.menuItem.findMany({ include: { category: true } });
  },
  createMenuItem: async (data: { name: string; price: number; categoryId: string; status?: string }) => {
    return prisma.menuItem.create({ data });
  },
  updateMenuItem: async (id: string, data: { name?: string; price?: number; categoryId?: string; status?: string }) => {
    return prisma.menuItem.update({ where: { id }, data });
  },
  deleteMenuItem: async (id: string) => {
    return prisma.menuItem.delete({ where: { id } });
  }
};
