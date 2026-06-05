import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Vui lòng nhập đầy đủ thông tin');
    
    try {
      setLoading(true);
      const user = await authService.login(username, password);
      login(user);
      toast.success(`Xin chào, ${user.name}`);
    } catch (e: any) {
      toast.error(e.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-tight">Lukari OS</h1>
          <p className="text-muted mt-2">Hệ thống quản lý nhà hàng thông minh</p>
        </div>
        
        <Card className="border-none shadow-soft">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-ink mb-6">Đăng nhập ca làm việc</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Tài khoản</label>
                <Input 
                  placeholder="Nhập tên đăng nhập" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Mật khẩu</label>
                <Input 
                  type="password"
                  placeholder="Nhập mật khẩu" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full h-12 text-base mt-6" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
