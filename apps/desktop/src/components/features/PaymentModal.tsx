import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { paymentService } from '../../services/api';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tableId: string;
  totalAmount: number;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, orderId, tableId, totalAmount, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState('CASH');
  const [cashGiven, setCashGiven] = useState(totalAmount.toString());

  const handlePayment = async () => {
    try {
      await paymentService.process({
        orderId,
        amount: totalAmount,
        method,
        tableId,
        nextTableStatus: 'NEED_CLEANING'
      });
      toast.success('Thanh toán thành công!');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error('Lỗi thanh toán: ' + e.message);
    }
  };

  const cash = parseFloat(cashGiven) || 0;
  const change = Math.max(0, cash - totalAmount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán hóa đơn">
      <div className="space-y-6">
        <div className="flex justify-between items-center py-4 border-b border-hairline">
          <span className="text-lg text-muted">Tổng thanh toán</span>
          <span className="text-3xl font-bold text-primary">{totalAmount.toLocaleString()} đ</span>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Phương thức thanh toán</label>
          <div className="grid grid-cols-2 gap-3">
            <Button variant={method === 'CASH' ? 'primary' : 'outline'} onClick={() => setMethod('CASH')}>Tiền mặt</Button>
            <Button variant={method === 'BANK_TRANSFER' ? 'primary' : 'outline'} onClick={() => setMethod('BANK_TRANSFER')}>Chuyển khoản</Button>
            <Button variant={method === 'CARD' ? 'primary' : 'outline'} onClick={() => setMethod('CARD')}>Thẻ (POS)</Button>
            <Button variant={method === 'E_WALLET' ? 'primary' : 'outline'} onClick={() => setMethod('E_WALLET')}>Ví điện tử</Button>
          </div>
        </div>

        {method === 'CASH' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiền khách đưa (đ)</label>
              <Input type="number" value={cashGiven} onChange={e => setCashGiven(e.target.value)} />
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted">Tiền thừa trả khách</span>
              <span className="font-semibold">{change.toLocaleString()} đ</span>
            </div>
          </div>
        )}

        <Button className="w-full h-14 text-lg" variant="primary" onClick={handlePayment}>
          Hoàn tất thanh toán
        </Button>
      </div>
    </Modal>
  );
}
