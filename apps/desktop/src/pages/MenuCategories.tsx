import React, { useEffect, useState } from 'react';
import { menuService } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function MenuCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const catData = await menuService.getCategories();
      setCategories(catData);
    } catch (e: any) {
      toast.error('Lỗi tải dữ liệu: ' + e.message);
    }
  };

  const handleOpenCategoryModal = (cat: any = null) => {
    setEditingCategory(cat);
    setCategoryName(cat ? cat.name : '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return toast.error('Vui lòng nhập tên danh mục');
    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, categoryName);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await menuService.createCategory(categoryName);
        toast.success('Thêm danh mục thành công');
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error('Lỗi: ' + e.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await menuService.deleteCategory(deleteConfirm.id);
      toast.success('Xóa danh mục thành công');
      loadData();
    } catch (e: any) {
      toast.error('Lỗi xóa: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Quản lý Danh mục</h1>
        <Button variant="primary" onClick={() => handleOpenCategoryModal()}>
          <Plus className="w-4 h-4 mr-2" /> Thêm Danh Mục
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenCategoryModal(cat)} className="p-1 text-muted hover:text-primary"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: cat.id, name: cat.name })} className="p-1 text-muted hover:text-error"><Trash2 size={16} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!categories.length && <TableRow><TableCell colSpan={2} className="text-center text-muted">Chưa có danh mục</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên danh mục</label>
            <Input autoFocus value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="VD: Đồ uống, Món khai vị..." />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveCategory}>Lưu lại</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirm.name}" không?`}
        confirmText="Xóa"
        isDestructive={true}
      />
    </div>
  );
}
