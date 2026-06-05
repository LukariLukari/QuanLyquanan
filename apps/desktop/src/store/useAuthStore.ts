import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        // Fallback for old cached data where permissions might be undefined
        if (!user.permissions) {
          if (user.role === 'ADMIN') return true;
          return false;
        }
        
        if (user.permissions.includes('ADMIN')) return true; // Let's say ADMIN has all permissions, but our seed actually grants all explicit permissions to ADMIN role.
        return user.permissions.includes(permission);
      }
    }),
    {
      name: 'lukari-auth',
    }
  )
);
