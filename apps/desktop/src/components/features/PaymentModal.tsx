import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { paymentService } from '../../services/api';
import { toast } from 'sonner';
import { BillPreviewModal } from './BillPreviewModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tableId: string;
  tableName: string;
  totalAmount: number;
  order: any;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, orderId, tableId, tableName, totalAmount, order, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState('CASH');
  const [cashGiven, setCashGiven] = useState(totalAmount.toString());
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handlePayment = async (shouldPrint: boolean) => {
    try {
      await paymentService.process({
        orderId,
        amount: totalAmount,
        method,
        tableId: tableId === 'TAKEAWAY' ? undefined : tableId,
        nextTableStatus: tableId === 'TAKEAWAY' ? undefined : 'NEED_CLEANING'
      });
      toast.success('Thanh toán thành công!');
      
      if (shouldPrint) {
        // Khởi tạo HTML Hóa đơn và hiển thị Preview Modal
        generateReceipt();
      } else {
        onSuccess();
        onClose();
      }
    } catch (e: any) {
      toast.error('Lỗi thanh toán: ' + e.message);
    }
  };

  const generateReceipt = () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; width: 300px; margin: 0 auto; padding: 10px; font-size: 12px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 18px; }
            .text-lg { font-size: 16px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .flex { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { text-align: left; padding: 4px 0; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="text-center border-b">
            <div class="font-bold text-xl mb-2">LUKARI RESTAURANT</div>
            <div>ĐC: Số 123 Đường B, Quận C, TP. D</div>
            <div>SĐT: 0123 456 789</div>
          </div>
          
          <div class="text-center font-bold text-lg mb-4">HÓA ĐƠN THANH TOÁN</div>
          
          <div class="border-b">
            <div class="flex"><span>Mã HĐ:</span> <span>${orderId.slice(-6).toUpperCase()}</span></div>
            <div class="flex"><span>Ngày:</span> <span>${new Date().toLocaleString('vi-VN')}</span></div>
            <div class="flex"><span>Khu vực:</span> <span>${tableName}</span></div>
          </div>

          <table class="border-b">
            <thead>
              <tr>
                <th>Món</th>
                <th class="text-center">SL</th>
                <th class="text-right">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>${item.itemName}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="border-b">
            ${order.discount ? `<div class="flex"><span>Giảm giá:</span> <span>-${order.discount.toLocaleString()} đ</span></div>` : ''}
            ${order.surcharge ? `<div class="flex"><span>Phụ thu:</span> <span>+${order.surcharge.toLocaleString()} đ</span></div>` : ''}
            <div class="flex"><span>VAT:</span> <span>${order.vat}%</span></div>
            <div class="flex font-bold text-lg mt-2">
              <span>TỔNG CỘNG:</span> 
              <span>${totalAmount.toLocaleString()} đ</span>
            </div>
          </div>

          <div class="text-center mb-4">
            <div>Cảm ơn quý khách và hẹn gặp lại!</div>
            <div class="mt-2 font-bold">WIFI: Lukari_Guest</div>
            <div>Pass: 88888888</div>
          </div>
        </body>
      </html>
    `;
    
    setPreviewHtml(html);
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

        <div className="flex gap-3">
          <Button className="flex-1 h-14 text-lg" variant="outline" onClick={() => handlePayment(false)}>
            Hoàn tất
          </Button>
          <Button className="flex-1 h-14 text-lg" variant="primary" onClick={() => handlePayment(true)}>
            Hoàn tất & In Bill
          </Button>
        </div>
      </div>

      <BillPreviewModal
        isOpen={!!previewHtml}
        onClose={() => {
          setPreviewHtml(null);
          onClose(); // Đóng Modal thanh toán sau khi đóng Preview
        }}
        htmlContent={previewHtml || ''}
      />
    </Modal>
  );
}
