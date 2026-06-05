import { Search, Bell, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Input } from '../ui/Input';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <Input 
            className="pl-10 rounded-pill bg-surface-soft border-transparent focus-visible:bg-canvas focus-visible:border-primary" 
            placeholder="Tìm kiếm đơn hàng, sản phẩm..." 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="relative p-2 text-muted hover:text-ink transition-colors" title="Chuyển chế độ giao diện">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="relative p-2 text-muted hover:text-ink transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-hairline">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-sm">
            <div className="font-semibold text-ink">{user?.name}</div>
            <div className="text-xs text-muted">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
