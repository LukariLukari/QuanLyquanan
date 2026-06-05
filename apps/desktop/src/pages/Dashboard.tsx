import React, { useState, useEffect } from 'react';
import { settingService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { TrendingUp, DollarSign, Receipt, Wallet, PiggyBank } from 'lucide-react';

export function Dashboard() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    settingService.getStats().then(setDashboardStats);
  }, []);

  if (!dashboardStats) return <div>Đang tải...</div>;

  const stats = [
    { label: 'Doanh thu hôm nay', value: `${(dashboardStats.revenueToday || 0).toLocaleString()} đ`, icon: DollarSign, trend: '+0%' },
    { label: 'Chi phí hôm nay', value: `${(dashboardStats.expensesToday || 0).toLocaleString()} đ`, icon: Receipt, trend: '+0%' },
    { label: 'Lãi/lỗ tạm tính', value: `${(dashboardStats.netIncomeToday || 0).toLocaleString()} đ`, icon: TrendingUp, trend: '+0%' },
    { label: 'Quỹ Tiền mặt', value: `${(dashboardStats.cashBalance || 0).toLocaleString()} đ`, icon: Wallet, trend: '+0%' },
    { label: 'Quỹ Ngân hàng', value: `${(dashboardStats.bankBalance || 0).toLocaleString()} đ`, icon: PiggyBank, trend: '+0%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tổng quan</h1>
          <p className="text-muted mt-1">Theo dõi hoạt động kinh doanh của nhà hàng</p>
        </div>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => toast('Đã xuất báo cáo thành công!')}>
            Xuất báo cáo
          </Button>
          <Button onClick={() => setIsConfirmOpen(true)}>
            Mở ca làm việc
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="success">{stat.trend}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-muted text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-ink mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Bàn</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((item) => (
                <TableRow key={item}>
                  <TableCell className="font-medium">#ORD-{1000 + item}</TableCell>
                  <TableCell>Bàn {item}</TableCell>
                  <TableCell>10 phút trước</TableCell>
                  <TableCell>
                    <Badge variant={item % 2 === 0 ? 'success' : 'default'}>
                      {item % 2 === 0 ? 'Đã thanh toán' : 'Đang phục vụ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{(item * 150000).toLocaleString()} đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => toast.success('Đã mở ca làm việc mới')}
        title="Mở ca làm việc"
        description="Bạn có chắc chắn muốn mở ca làm việc mới không? Hệ thống sẽ ghi nhận thời gian bắt đầu ca."
        confirmText="Mở ca"
      />
    </div>
  );
}
