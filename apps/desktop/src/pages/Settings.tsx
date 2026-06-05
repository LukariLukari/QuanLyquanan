import React, { useEffect, useState } from 'react';
import { settingService, backupService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    settingService.getAll().then(setSettings);
  }, []);

  const handleBackup = async () => {
    try {
      const ok = await backupService.create();
      if (ok) toast.success('Đã lưu bản sao lưu thành công!');
    } catch (e: any) {
      toast.error('Lỗi khi backup: ' + e.message);
    }
  };

  const handleRestore = async () => {
    try {
      const ok = await backupService.restore();
      if (ok) toast.success('Phục hồi thành công! Đang khởi động lại...');
    } catch (e: any) {
      toast.error('Lỗi khi restore: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-ink">Cài đặt hệ thống</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên quán</label>
              <Input placeholder="Lukari Restaurant" defaultValue={settings['STORE_NAME']} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input placeholder="0901234567" defaultValue={settings['STORE_PHONE']} />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input placeholder="123 Đường ABC, Quận X" defaultValue={settings['STORE_ADDRESS']} />
            </div>
          </div>
          <Button>Lưu thông tin</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hóa đơn & Thuế</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">VAT (%)</label>
              <Input defaultValue={settings['VAT'] || '0'} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phí dịch vụ (%)</label>
              <Input defaultValue={settings['SURCHARGE'] || '0'} type="number" />
            </div>
          </div>
          <Button>Lưu cấu hình</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-x-3">
          <Button variant="outline" onClick={handleBackup}>Tạo bản sao lưu (Backup)</Button>
          <Button variant="danger" onClick={handleRestore}>Phục hồi dữ liệu (Restore)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
