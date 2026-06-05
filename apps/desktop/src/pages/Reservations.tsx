import React, { useState, useEffect } from 'react';
import { reservationService, tableService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { toast } from 'sonner';
import { Calendar, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';

export function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
    tableService.getTables().then(setTables);
  }, []);

  const loadData = async () => {
    const data = await reservationService.getAll();
    setReservations(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reservationService.create(formData);
      toast.success('Tạo đặt chỗ thành công');
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error('Lỗi tạo đặt chỗ');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await reservationService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      loadData();
    } catch (e: any) {
      toast.error('Lỗi cập nhật');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Đặt chỗ
          </h1>
          <p className="text-muted">Quản lý danh sách khách đặt bàn</p>
        </div>
        <Button onClick={() => { setFormData({ time: new Date().toISOString().slice(0,16), partySize: 2 }); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm đặt chỗ
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Bàn / Khu vực</TableHead>
                <TableHead>Số khách</TableHead>
                <TableHead>Tiền cọc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{format(new Date(r.time), 'dd/MM HH:mm')}</TableCell>
                  <TableCell>{r.customerName}</TableCell>
                  <TableCell>{r.customerPhone}</TableCell>
                  <TableCell>{r.diningTable?.name || 'Chưa xếp'}</TableCell>
                  <TableCell>{r.partySize}</TableCell>
                  <TableCell>{(r.deposit || 0).toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'CONFIRMED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'default'}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {r.status === 'PENDING' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'CONFIRMED')}>
                        Xác nhận
                      </Button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <Button size="sm" variant="success" onClick={() => updateStatus(r.id, 'ARRIVED')}>
                        Đã đến
                      </Button>
                    )}
                    {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                      <Button size="sm" variant="ghost" className="text-error" onClick={() => updateStatus(r.id, 'CANCELLED')}>
                        Hủy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Đặt chỗ">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tên khách hàng</label>
              <Input required value={formData.customerName || ''} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">SĐT</label>
              <Input required value={formData.customerPhone || ''} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Thời gian</label>
              <Input type="datetime-local" required value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Số khách</label>
              <Input type="number" required min="1" value={formData.partySize || ''} onChange={e => setFormData({...formData, partySize: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-sm font-medium">Bàn (Tùy chọn)</label>
              <select className="w-full h-10 px-3 rounded-md border border-hairline bg-canvas"
                value={formData.diningTableId || ''} onChange={e => setFormData({...formData, diningTableId: e.target.value})}>
                <option value="">Chưa chọn bàn</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tiền cọc</label>
              <Input type="number" value={formData.deposit || 0} onChange={e => setFormData({...formData, deposit: Number(e.target.value)})} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Input value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu Đặt chỗ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
