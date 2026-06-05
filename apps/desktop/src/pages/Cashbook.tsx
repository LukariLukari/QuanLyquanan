import React, { useEffect, useState } from 'react';
import { cashbookService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { translateStatus } from '../lib/statusLabels';

export function Cashbook() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState<{ balances: Record<string, number>, total: number }>({ balances: {}, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [txData, balData] = await Promise.all([
      cashbookService.getTransactions(),
      cashbookService.getBalances()
    ]);
    setTransactions(txData);
    setBalances(balData);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Sổ quỹ tiền</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-canvas border-none shadow-soft">
          <CardContent className="p-5">
            <div className="text-sm opacity-80 mb-1">Tổng quỹ hiện tại</div>
            <div className="text-2xl font-bold">{balances.total.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Tiền mặt (CASH)</div>
            <div className="text-xl font-bold text-ink">{(balances.balances['CASH'] || 0).toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Chuyển khoản (BANK)</div>
            <div className="text-xl font-bold text-ink">{(balances.balances['BANK_TRANSFER'] || balances.balances['BANK'] || 0).toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Ví điện tử / Thẻ</div>
            <div className="text-xl font-bold text-ink">{((balances.balances['CARD'] || 0) + (balances.balances['E_WALLET'] || 0)).toLocaleString()} đ</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày giao dịch</TableHead>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead>Thu / Chi</TableHead>
                <TableHead>PTTT</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-muted">#{tx.referenceId?.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.referenceType === 'ORDER' ? 'Đơn hàng' : tx.referenceType === 'EXPENSE' ? 'Chi phí' : tx.referenceType === 'REVENUE' ? 'Doanh thu' : tx.referenceType}</Badge>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`font-medium ${tx.type === 'IN' ? 'text-success' : 'text-error'}`}>
                    {tx.type === 'IN' ? '+' : '-'}{tx.amount.toLocaleString()} đ
                  </TableCell>
                  <TableCell>{translateStatus(tx.paymentMethod)}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'ACTIVE' ? 'success' : 'outline'}>{translateStatus(tx.status)}</Badge>
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
