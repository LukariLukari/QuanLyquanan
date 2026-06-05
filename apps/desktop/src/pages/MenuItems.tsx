import React, { useEffect, useState, useRef } from 'react';
import { menuService } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ImagePlus as ImageIcon } from 'lucide-react';

export function MenuItems() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({ name: '', price: '', categoryId: '', status: 'AVAILABLE', imageUrl: '' });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catData, itemData] = await Promise.all([
        menuService.getCategories(),
        menuService.getItems()
      ]);
      setCategories(catData);
      setItems(itemData);
    } catch (e: any) {
      toast.error('Lỗi tải dữ liệu: ' + e.message);
    }
  };

  const handleOpenItemModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setItemForm({ name: item.name, price: item.price.toString(), categoryId: item.categoryId, status: item.status, imageUrl: item.imageUrl || '' });
    } else {
      setItemForm({ name: '', price: '', categoryId: categories[0]?.id || '', status: 'AVAILABLE', imageUrl: '' });
    }
    setIsItemModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) {
      return toast.error('Vui lòng nhập đủ thông tin (Tên, Giá, Danh mục)');
    }
    try {
      const payload = {
        name: itemForm.name,
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        status: itemForm.status,
        imageUrl: itemForm.imageUrl
      };
      if (editingItem) {
        await menuService.updateItem(editingItem.id, payload);
        toast.success('Cập nhật món thành công');
      } else {
        await menuService.createItem(payload);
        toast.success('Thêm món thành công');
      }
      setIsItemModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error('Lỗi: ' + e.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await menuService.deleteItem(deleteConfirm.id);
      toast.success('Xóa món thành công');
      loadData();
    } catch (e: any) {
      toast.error('Lỗi xóa: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Danh sách món ăn</h1>
        <Button variant="primary" onClick={() => handleOpenItemModal()}>
          <Plus className="w-4 h-4 mr-2" /> Thêm Món
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Hình ảnh</TableHead>
                <TableHead>Tên món</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md border border-hairline" />
                    ) : (
                      <div className="w-10 h-10 bg-surface-soft rounded-md flex items-center justify-center text-muted">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name}</TableCell>
                  <TableCell>{item.price.toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'error'}>
                      {item.status === 'AVAILABLE' ? 'Đang bán' : 'Hết hàng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenItemModal(item)} className="p-1 text-muted hover:text-primary"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, name: item.name })} className="p-1 text-muted hover:text-error"><Trash2 size={16} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && <TableRow><TableCell colSpan={6} className="text-center text-muted">Chưa có món nào</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? "Sửa món ăn" : "Thêm món mới"}>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div 
              className="w-20 h-20 rounded-lg border-2 border-dashed border-hairline flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden bg-surface-soft"
              onClick={() => fileInputRef.current?.click()}
            >
              {itemForm.imageUrl ? (
                <img src={itemForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={20} className="text-muted mb-1" />
                  <span className="text-[10px] text-muted">Chọn ảnh</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <div className="flex-1">
              <label className="text-sm font-medium">Tên món</label>
              <Input autoFocus value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="VD: Lẩu nấm, Bia Hà Nội..." className="mt-1" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Giá bán (đ)</label>
            <Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="VD: 50000" />
          </div>
          <div>
            <label className="text-sm font-medium">Danh mục</label>
            <select 
              className="w-full h-12 px-4 rounded-lg border border-hairline bg-surface-soft focus:outline-none focus:border-primary mt-1"
              value={itemForm.categoryId} 
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
            >
              <option value="" disabled>-- Chọn danh mục --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select 
              className="w-full h-12 px-4 rounded-lg border border-hairline bg-surface-soft focus:outline-none focus:border-primary mt-1"
              value={itemForm.status} 
              onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
            >
              <option value="AVAILABLE">Đang bán</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsItemModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveItem}>Lưu món</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa món "${deleteConfirm.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        isDestructive={true}
      />
    </div>
  );
}
