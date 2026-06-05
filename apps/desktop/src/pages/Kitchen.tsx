import React, { useState, useEffect } from 'react';
import { kitchenService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { Flame, CheckCircle, Clock } from 'lucide-react';

export function Kitchen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const data = await kitchenService.getPending();
    setItems(data);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await kitchenService.updateStatus(id, status);
      loadData();
    } catch (e: any) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const grouped = items.reduce((acc, item) => {
    const key = item.order?.diningTable?.name || 'Mang đi';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Flame className="h-6 w-6 text-error" />
            Màn hình Bếp (KDS)
          </h1>
          <p className="text-muted">Quản lý các món đang chờ chế biến</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(grouped).map(([tableName, tableItems]) => (
          <Card key={tableName} className="border-error/20 bg-error/5">
            <div className="p-4 border-b border-error/10 flex justify-between items-center bg-white/50">
              <h3 className="font-bold text-lg text-ink">{tableName}</h3>
              <Badge variant="default">{tableItems.length} món</Badge>
            </div>
            <CardContent className="p-4 space-y-3">
              {tableItems.map((item: any) => {
                const waitTime = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 60000);
                const isLate = waitTime > 15;

                return (
                  <div key={item.id} className="flex flex-col gap-2 p-3 bg-canvas rounded-lg border border-hairline">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-ink flex items-center gap-2">
                          <span className="text-lg">{item.quantity}x</span> {item.itemName}
                        </div>
                        {item.note && <div className="text-sm text-error mt-1 italic">Ghi chú: {item.note}</div>}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${isLate ? 'text-error font-bold' : 'text-muted'}`}>
                        <Clock className="h-3 w-3" /> {waitTime}p
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-hairline">
                      <Badge variant={item.status === 'PENDING' ? 'warning' : 'default'}>
                        {item.status === 'PENDING' ? 'Đang chờ' : 'Đang làm'}
                      </Badge>
                      <div className="flex gap-2">
                        {item.status === 'PENDING' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'PREPARING')}>
                            Bắt đầu làm
                          </Button>
                        )}
                        {item.status === 'PREPARING' && (
                          <Button size="sm" variant="success" onClick={() => updateStatus(item.id, 'READY')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Xong món
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="col-span-full py-12 text-center text-muted">
            <Flame className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Tuyệt vời! Hiện không có món nào đang chờ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
