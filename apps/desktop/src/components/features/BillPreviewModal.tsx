import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { Printer } from 'lucide-react';

interface BillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
}

export function BillPreviewModal({ isOpen, onClose, htmlContent }: BillPreviewModalProps) {
  const handlePrint = async () => {
    try {
      await (window as any).api?.invoke('printer:printBill', htmlContent);
      toast.success('Đã gửi lệnh in!');
      onClose();
    } catch (e: any) {
      console.error('Lỗi in:', e);
      toast.error('Không thể in hóa đơn. Vui lòng kiểm tra lại máy in.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xem trước Hóa đơn">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white p-4 shadow-xl rounded-lg border border-hairline w-[340px] flex justify-center max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            className="w-full text-black"
          />
        </div>
        
        <div className="flex justify-end gap-3 w-full border-t border-hairline pt-4">
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer size={18} /> In ngay
          </Button>
        </div>
      </div>
    </Modal>
  );
}
