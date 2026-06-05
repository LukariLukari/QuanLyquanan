import React, { useEffect, useState } from 'react';
import { financeService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export function Finance() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category: 'Khác', amount: '', description: '', paymentMethod: 'CASH' });

  const EXPENSE_CATEGORIES = ['Nhập hàng', 'Lương', 'Mặt bằng', 'Điện nước', 'Marketing', 'Sửa chữa', 'Công cụ dụng cụ', 'Chi phát sinh', 'Khác'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [expData, revData] = await Promise.all([
      financeService.getExpenses(),
      financeService.getRevenues()
    ]);
    setExpenses(expData);
    setRevenues(revData);
  };

  const handleCreateExpense = async () => {
    try {
      await financeService.createExpense({
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        createdBy: 'Admin'
      });
      toast.success('Đã tạo phiếu chi');
      setIsExpenseModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error('Lỗi tạo phiếu chi: ' + e.message);
    }
  };

  const handleCancelExpense = async (id: string) => {
    if (confirm('Bạn có chắc muốn hủy khoản chi này? (Sẽ ghi nhận AuditLog)')) {
      try {
        await financeService.cancelExpense(id, 'Hủy do người dùng yêu cầu', 'Admin');
        toast.success('Đã hủy khoản chi');
        loadData();
      } catch (e: any) {
        toast.error('Lỗi khi hủy: ' + e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Quản lý Thu / Chi</h1>
        <div className="space-x-3">
          <Button variant="outline">Tạo phiếu thu</Button>
          <Button variant="primary" onClick={() => setIsExpenseModalOpen(true)}>Tạo phiếu chi</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>PTTT</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium text-muted">#{exp.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="error">Chi: {exp.category}</Badge>
                  </TableCell>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell className="text-error font-medium">-{exp.amount.toLocaleString()} đ</TableCell>
                  <TableCell>{exp.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={exp.status === 'ACTIVE' ? 'success' : 'outline'}>{exp.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {exp.status === 'ACTIVE' && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancelExpense(exp.id)} className="text-error hover:text-error">Hủy</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Tạo phiếu chi mới">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại chi phí</label>
            <select 
              className="w-full p-2.5 rounded-lg border border-hairline bg-surface outline-none focus:border-primary"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Số tiền</label>
            <Input type="number" placeholder="Ví dụ: 1500000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phương thức thanh toán</label>
            <select 
              className="w-full p-2.5 rounded-lg border border-hairline bg-surface outline-none focus:border-primary"
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="CASH">Tiền mặt</option>
              <option value="BANK">Chuyển khoản</option>
              <option value="CARD">Thẻ</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Diễn giải</label>
            <Input placeholder="Ghi chú chi tiết khoản chi" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateExpense}>Tạo phiếu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
