import React, { useState, useEffect } from 'react';
import { staffService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';

export function Staff() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [s, r] = await Promise.all([staffService.getStaffs(), staffService.getRoles()]);
    setStaffs(s);
    setRoles(r);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await staffService.updateStaff(formData.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await staffService.createStaff(formData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi lưu nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn cho nghỉ việc nhân viên này?')) {
      try {
        await staffService.deleteStaff(id);
        toast.success('Đã cập nhật trạng thái nghỉ việc');
        loadData();
      } catch (e: any) {
        toast.error(e.message || 'Lỗi xóa nhân viên');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Nhân viên
          </h1>
          <p className="text-muted">Quản lý danh sách nhân sự và quyền truy cập</p>
        </div>
        <Button onClick={() => { setFormData({ status: 'ACTIVE' }); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffs.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.code}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.role?.name}</Badge>
                  </TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'INACTIVE' ? 'warning' : 'default'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setFormData(s); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? 'Sửa nhân viên' : 'Thêm nhân viên'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mã NV</label>
              <Input required value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Họ tên</label>
              <Input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <Input required value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Mật khẩu {formData.id ? '(Bỏ trống nếu không đổi)' : ''}</label>
              <Input type="password" required={!formData.id} value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Vai trò</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:border-primary"
                required
                value={formData.roleId || ''}
                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
              >
                <option value="">Chọn vai trò</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">SĐT</label>
              <Input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Lương cơ bản / Tháng</label>
              <Input type="number" value={formData.baseSalary || 0} onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium">Lương theo giờ</label>
              <Input type="number" value={formData.hourlyRate || 0} onChange={e => setFormData({ ...formData, hourlyRate: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" disabled={loading}>Lưu</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
