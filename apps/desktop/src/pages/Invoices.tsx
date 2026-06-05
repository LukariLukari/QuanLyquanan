import React, { useEffect, useState } from 'react';
import { paymentService } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    paymentService.getInvoices().then(setInvoices);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Hóa đơn & Lịch sử bán hàng</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Bàn</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead className="text-right">Tổng cộng</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">#{inv.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{new Date(inv.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{inv.order?.diningTable?.name || 'Mang đi'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inv.order?.payments?.[0]?.method || 'CASH'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {inv.total.toLocaleString()} đ
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Xem</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
