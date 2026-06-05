import React from 'react';
import { cn } from '../../lib/utils';
import { LayoutDashboard, ShoppingCart, LayoutGrid, Coffee, Settings, FileText, Wallet, PiggyBank, Users, Clock, Calculator, Flame, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { NavLink, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/', permission: 'VIEW_DASHBOARD' },
    { icon: ShoppingCart, label: 'Bán hàng (POS)', path: '/pos', permission: 'SALES' },
    { icon: LayoutGrid, label: 'Bàn ăn', path: '/tables', permission: 'SALES' },
    { icon: Calendar, label: 'Đặt chỗ', path: '/reservations', permission: 'SALES' },
    { icon: Flame, label: 'Bếp (KDS)', path: '/kitchen', permission: 'KITCHEN' },
    { icon: FileText, label: 'Hóa đơn', path: '/invoices', permission: 'SALES' },
    { 
      icon: Coffee, 
      label: 'Thực đơn', 
      path: '/menu/items', // Default path for active match
      permission: 'MANAGE_MENU',
      children: [
        { label: 'Danh sách món', path: '/menu/items' },
        { label: 'Danh mục', path: '/menu/categories' }
      ]
    },
    { icon: Users, label: 'Nhân viên', path: '/staff', permission: 'MANAGE_STAFF' },
    { icon: Clock, label: 'Chấm công', path: '/attendance', permission: 'MANAGE_STAFF' },
    { icon: Calculator, label: 'Tính lương', path: '/payroll', permission: 'MANAGE_STAFF' },
    { icon: Wallet, label: 'Thu / Chi', path: '/finance', permission: 'MANAGE_FINANCE' },
    { icon: PiggyBank, label: 'Sổ quỹ', path: '/cashbook', permission: 'MANAGE_FINANCE' },
    { icon: FileText, label: 'Báo cáo', path: '/reports', permission: 'VIEW_REPORTS' },
    { icon: Settings, label: 'Cài đặt', path: '/settings', permission: 'MANAGE_SETTINGS' },
  ];

  return (
    <aside className="w-64 bg-surface-card border-r border-hairline flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-hairline">
        <h1 className="text-xl font-bold text-primary">Lukari OS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          return (
            <div key={item.path || item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive || location.pathname.startsWith(item.path) && item.children
                    ? "bg-primary text-canvas" 
                    : "text-muted hover:bg-surface-soft hover:text-ink"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
              
              {item.children && location.pathname.startsWith('/menu') && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) => cn(
                        "block px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive 
                          ? "text-primary font-medium bg-primary/10" 
                          : "text-muted hover:text-ink hover:bg-surface-soft"
                      )}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
