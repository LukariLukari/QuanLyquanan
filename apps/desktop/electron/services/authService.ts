import { prisma } from './db';
import * as crypto from 'crypto';

export const authService = {
  login: async (username: string, passwordRaw: string) => {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!user) {
      throw new Error('Sai tài khoản hoặc mật khẩu');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Tài khoản đã bị khóa hoặc vô hiệu hóa');
    }

    // In a real app, you should hash and compare.
    // For this local app, if you want real hashing: 
    // crypto.pbkdf2Sync(passwordRaw, salt, 1000, 64, `sha512`).toString(`hex`);
    // Here we just do a simple check or simple hash. Let's assume plain text for simplicity or a simple hash if implemented in createStaff.
    // Let's use simple match for MVP
    if (user.password !== passwordRaw && user.password !== hashPassword(passwordRaw)) {
      throw new Error('Sai tài khoản hoặc mật khẩu');
    }

    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        userId: user.id,
        details: `Người dùng ${user.username} đăng nhập thành công.`
      }
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role.name,
      permissions: user.role.permissions.map(p => p.name)
    };
  }
};

export function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
