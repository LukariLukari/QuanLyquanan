import React, { useState, useEffect } from 'react';
import { payrollService, staffService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { toast } from 'sonner';
import { Calculator, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function Payroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadData();
    staffService.getStaffs().then(setStaffs);
  }, [month]);

  const loadData = async () => {
    const data = await payrollService.getPayrolls(month);
    setPayrolls(data);
  };

  const handleCalculateAll = async () => {
    try {
      for (const s of staffs) {
        if (s.status !== 'ACTIVE') continue;
        await payrollService.calculatePayroll(month, s.id);
      }
      toast.success('Đã tính lại lương cho toàn bộ nhân viên');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tính lương');
    }
  };

  const handleLock = async (id: string) => {
    if (confirm('Khóa bảng lương sẽ tự động tạo phiếu chi trong Sổ quỹ và không thể hoàn tác. Bạn chắc chắn chứ?')) {
      try {
        await payrollService.lockPayroll(id, user!.id);
        toast.success('Đã chốt lương và ghi vào sổ quỹ');
        loadData();
      } catch (e: any) {
        toast.error(e.message || 'Lỗi khóa lương');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Bảng lương
          </h1>
          <p className="text-muted">Tính lương tháng và chốt lương</p>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="month" 
            value={month} 
            onChange={e => setMonth(e.target.value)}
            className="h-10 px-3 rounded-md border border-hairline bg-canvas"
          />
          <Button onClick={handleCalculateAll} variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" /> Tính lại tất cả
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Tổng công</TableHead>
                <TableHead>Tổng giờ</TableHead>
                <TableHead>Lương tính ra</TableHead>
                <TableHead>Thực nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.user?.name}</TableCell>
                  <TableCell>{p.totalDays} ngày</TableCell>
                  <TableCell>{p.totalHours} h</TableCell>
                  <TableCell>{(p.calculatedSalary || 0).toLocaleString()} đ</TableCell>
                  <TableCell className="font-bold text-primary">{(p.netSalary || 0).toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'LOCKED' ? 'success' : 'default'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === 'DRAFT' && (
                      <Button variant="danger" size="sm" onClick={() => handleLock(p.id)}>
                        <Lock className="h-4 w-4 mr-1" /> Chốt lương
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
