import React, { useEffect, useState } from 'react';
import { tableService, menuService, orderService } from '../services/api';
import { usePosStore } from '../store/usePosStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { PaymentModal } from '../components/features/PaymentModal';
import { Plus, Minus, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/ui/Modal';

export function POS() {
  const [areas, setAreas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [cancelModalItem, setCancelModalItem] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [posMode, setPosMode] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');

  const user = useAuthStore(state => state.user);
  const { selectedTableId, currentOrder, setSelectedTable, addItem, updateItemQuantity, removeItem, clearOrder } = usePosStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [areasData, categoriesData, itemsData] = await Promise.all([
      tableService.getAreas(),
      menuService.getCategories(),
      menuService.getItems()
    ]);
    setAreas(areasData);
    setCategories(categoriesData);
    setMenuItems(itemsData);
  };

  const handleTableSelect = async (table: any) => {
    if (table.status === 'OCCUPIED') {
      const order = await orderService.getOpen(table.id);
      setSelectedTable(table.id, order);
    } else {
      setSelectedTable(table.id, null);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedTableId || !currentOrder || currentOrder.items.length === 0) return;
    
    const subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal - currentOrder.discount + currentOrder.surcharge + (subtotal * currentOrder.vat / 100);

    try {
      if (currentOrder.id) {
        await orderService.update(currentOrder.id, {
          items: currentOrder.items,
          totalAmount,
          discount: currentOrder.discount,
          surcharge: currentOrder.surcharge,
          vat: currentOrder.vat
        });
      } else {
        const newOrder = await orderService.create({
          diningTableId: selectedTableId === 'TAKEAWAY' ? null : selectedTableId,
          items: currentOrder.items,
          totalAmount,
          discount: currentOrder.discount,
          surcharge: currentOrder.surcharge,
          vat: currentOrder.vat
        });
        setSelectedTable(selectedTableId, newOrder);
      }
      toast.success('Đã lưu order');
      loadData(); // reload table status
    } catch (e: any) {
      toast.error('Lỗi khi lưu order: ' + e.message);
    }
  };

  const handleRemoveItem = (item: any) => {
    // If it's a new item (Math.random id has '.'), just remove locally
    if (item.id.includes('.')) {
      removeItem(item.id);
    } else {
      setCancelModalItem(item);
    }
  };

  const confirmCancelItem = async () => {
    try {
      const reason = cancelReason.trim() || 'Hủy bởi nhân viên';
      await orderService.cancelItem(cancelModalItem.id, reason, user!.id);
      toast.success('Hủy món thành công');
      setCancelModalItem(null);
      setCancelReason('');
      
      // reload order
      const order = await orderService.getOpen(selectedTableId!);
      setSelectedTable(selectedTableId, order);
    } catch (e: any) {
      toast.error('Lỗi hủy món: ' + e.message);
    }
  };

  const handleTransferTable = async () => {
    if (!transferTargetId) return toast.error('Vui lòng chọn bàn muốn chuyển đến');
    try {
      await orderService.transferTable(currentOrder!.id!, transferTargetId, user!.id);
      toast.success('Chuyển bàn thành công');
      setIsTransferModalOpen(false);
      clearOrder();
      loadData();
    } catch (e: any) {
      toast.error('Lỗi chuyển bàn: ' + e.message);
    }
  };

  const subtotal = currentOrder?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const totalAmount = subtotal - (currentOrder?.discount || 0) + (currentOrder?.surcharge || 0) + (subtotal * (currentOrder?.vat || 0) / 100);

  return (
    <div className="flex flex-col h-full gap-4 -m-6 p-4 bg-secondary">
      {/* Top Bar: Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={posMode === 'DINE_IN' ? 'primary' : 'outline'}
          className={posMode === 'DINE_IN' ? 'shadow-soft' : 'bg-canvas text-muted border-transparent'}
          onClick={() => {
            setPosMode('DINE_IN');
            if (selectedTableId === 'TAKEAWAY') setSelectedTable(null, null);
          }}
        >
          Tại chỗ (Bàn ăn)
        </Button>
        <Button 
          variant={posMode === 'TAKEAWAY' ? 'primary' : 'outline'}
          className={posMode === 'TAKEAWAY' ? 'shadow-soft' : 'bg-canvas text-muted border-transparent'}
          onClick={() => {
            setPosMode('TAKEAWAY');
            setSelectedTable('TAKEAWAY', null);
          }}
        >
          Mang đi (Bán lẻ)
        </Button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Cột Trái: Bàn */}
        {posMode === 'DINE_IN' && (
          <div className="w-1/4 bg-surface-card rounded-xl shadow-soft flex flex-col overflow-hidden">
            <div className="p-4 border-b border-hairline bg-canvas">
              <h2 className="font-bold text-lg">Khu vực & Bàn</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {areas.map(area => (
            <div key={area.id}>
              <h3 className="text-sm font-semibold text-muted mb-3">{area.name}</h3>
              <div className="grid grid-cols-2 gap-3">
                {area.tables.map((table: any) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedTableId === table.id ? 'border-primary ring-1 ring-primary shadow-sm' : 
                      table.status === 'OCCUPIED' ? 'border-error/30 bg-error/5' : 
                      'border-hairline hover:border-primary/30 bg-canvas'
                    }`}
                  >
                    <div className="font-medium text-ink">{table.name}</div>
                    <div className="text-xs text-muted mt-1">
                      {table.status === 'AVAILABLE' ? 'Trống' : table.status === 'OCCUPIED' ? 'Đang phục vụ' : table.status === 'RESERVED' ? 'Đã đặt' : table.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Cột Giữa: Menu */}
      <div className="flex-1 bg-surface-card rounded-xl shadow-soft flex flex-col overflow-hidden">
        <div className="p-4 border-b border-hairline bg-canvas flex gap-2 overflow-x-auto">
          <Button 
            variant={!activeCategory ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setActiveCategory(null)}
          >
            Tất cả
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {menuItems.filter(item => !activeCategory || item.categoryId === activeCategory).map(item => (
              <button
                key={item.id}
                onClick={() => selectedTableId ? addItem(item) : toast.error('Vui lòng chọn bàn trước')}
                className="bg-canvas border border-hairline p-3 rounded-xl text-left hover:border-primary/30 hover:shadow-soft transition-all flex flex-col group overflow-hidden"
              >
                <div className="w-full h-24 mb-3 bg-surface-soft rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted font-medium text-xs">Không có ảnh</div>
                  )}
                </div>
                <div className="font-medium text-ink line-clamp-2 h-10 mb-1">{item.name}</div>
                <div className="font-bold text-primary">{item.price.toLocaleString()} đ</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cột Phải: Order */}
      <div className="w-[380px] bg-canvas rounded-xl shadow-soft flex flex-col overflow-hidden">
        <div className="p-4 border-b border-hairline bg-surface-soft flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Hóa đơn tạm tính</h2>
            {selectedTableId && (
              <Badge variant="success">
                {selectedTableId === 'TAKEAWAY' ? 'Bán mang đi' : 'Bàn đang chọn'}
              </Badge>
            )}
          </div>
          {currentOrder?.id && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setIsTransferModalOpen(true)}>
                <ArrowRightLeft className="w-3 h-3 mr-1" /> Chuyển bàn
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentOrder?.items.map(item => (
            <div key={item.id} className="flex gap-3 bg-surface-card p-3 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-ink">{item.itemName}</div>
                <div className="text-sm text-primary font-semibold mt-1">{(item.price * item.quantity).toLocaleString()} đ</div>
              </div>
              <div className="flex items-center gap-2 bg-canvas border border-hairline rounded-lg p-1">
                <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-surface-soft rounded text-muted"><Minus size={16} /></button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-surface-soft rounded text-muted"><Plus size={16} /></button>
              </div>
              <button onClick={() => handleRemoveItem(item)} className="p-2 text-error hover:bg-error/10 rounded-lg"><Trash2 size={18} /></button>
            </div>
          ))}
          {!currentOrder?.items.length && (
            <div className="text-center text-muted py-10">Chưa có món nào được chọn</div>
          )}
        </div>

        <div className="p-4 bg-surface-soft border-t border-hairline space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tạm tính</span>
            <span className="font-medium">{subtotal.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between items-center font-bold text-xl pt-2 border-t border-hairline">
            <span>Tổng cộng</span>
            <span className="text-primary">{totalAmount.toLocaleString()} đ</span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 bg-canvas border-t border-hairline">
          <Button variant="outline" onClick={handleSaveOrder} disabled={!currentOrder?.items.length}>Lưu Order</Button>
          <Button 
            variant="primary" 
            disabled={!currentOrder?.id} 
            onClick={() => setIsPaymentOpen(true)}
          >
            Thanh toán
          </Button>
        </div>
      </div>

      {currentOrder?.id && selectedTableId && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          orderId={currentOrder.id}
          tableId={selectedTableId}
          tableName={
            selectedTableId === 'TAKEAWAY' 
              ? 'Mang đi' 
              : areas.flatMap(a => a.tables).find(t => t.id === selectedTableId)?.name || 'Bàn không xác định'
          }
          totalAmount={totalAmount}
          order={currentOrder}
          onSuccess={() => {
            clearOrder();
            loadData();
          }}
        />
      )}

      {/* Modal Hủy món */}
      <Modal isOpen={!!cancelModalItem} onClose={() => setCancelModalItem(null)} title="Hủy món đã gọi">
        <div className="space-y-4">
          <p className="text-sm text-muted">Bạn đang hủy món: <strong>{cancelModalItem?.itemName}</strong> (x{cancelModalItem?.quantity})</p>
          <div>
            <label className="text-sm font-medium">Lý do hủy (không bắt buộc)</label>
            <Input autoFocus value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="VD: Khách đổi ý, Hết món..." />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setCancelModalItem(null)}>Đóng</Button>
            <Button variant="danger" onClick={confirmCancelItem}>Xác nhận hủy</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Chuyển bàn */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Chuyển bàn">
        <div className="space-y-4">
          <p className="text-sm text-muted">Chọn bàn mới để chuyển toàn bộ order hiện tại sang:</p>
          <select 
            className="w-full h-10 px-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:border-primary"
            value={transferTargetId} 
            onChange={(e) => setTransferTargetId(e.target.value)}
          >
            <option value="">-- Chọn bàn --</option>
            {areas.map(area => (
              <optgroup key={area.id} label={area.name}>
                {area.tables.filter((t:any) => t.status !== 'OCCUPIED').map((t:any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status === 'AVAILABLE' ? 'Trống' : t.status === 'RESERVED' ? 'Đã đặt' : t.status})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleTransferTable}>Thực hiện</Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
