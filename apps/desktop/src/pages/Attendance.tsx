import React, { useState, useEffect } from 'react';
import { attendanceService, staffService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { toast } from 'sonner';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { translateStatus } from '../lib/statusLabels';

export function Attendance() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load current month's attendance
    const start = new Date();
    start.setDate(1);
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23,59,59,999);

    const data = await attendanceService.getAttendances(start, end);
    setAttendances(data);
  };

  const handleCheckIn = async (shift: string) => {
    try {
      await attendanceService.checkIn(user!.id, shift);
      toast.success('Check-in thành công');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi check-in');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await attendanceService.checkOut(id);
      toast.success('Check-out thành công');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi check-out');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Chấm công
          </h1>
          <p className="text-muted">Ghi nhận giờ làm việc hàng ngày</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCheckIn('MORNING')} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
            <LogIn className="h-4 w-4" /> Ca Sáng
          </Button>
          <Button onClick={() => handleCheckIn('AFTERNOON')} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
            <LogIn className="h-4 w-4" /> Ca Chiều
          </Button>
          <Button onClick={() => handleCheckIn('FULLDAY')} variant="primary" className="gap-2">
            <LogIn className="h-4 w-4" /> Cả ngày
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ca làm</TableHead>
                <TableHead>Giờ vào</TableHead>
                <TableHead>Giờ ra</TableHead>
                <TableHead>Tổng giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{format(new Date(a.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{a.user?.name}</TableCell>
                  <TableCell>{translateStatus(a.shift)}</TableCell>
                  <TableCell>{a.checkIn ? format(new Date(a.checkIn), 'HH:mm') : '-'}</TableCell>
                  <TableCell>{a.checkOut ? format(new Date(a.checkOut), 'HH:mm') : '-'}</TableCell>
                  <TableCell>{a.totalHours ? `${a.totalHours}h` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'COMPLETED' ? 'success' : 'error'}>
                      {translateStatus(a.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {a.status === 'PENDING' && a.userId === user?.id && (
                      <Button variant="danger" size="sm" onClick={() => handleCheckOut(a.id)}>
                        <LogOut className="h-4 w-4 mr-1" /> Ra ca
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
