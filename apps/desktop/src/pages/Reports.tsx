import React, { useEffect, useState } from 'react';
import { reportService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '../components/ui/Button';

export function Reports() {
  const [sales, setSales] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);
  
  // Date range: default last 30 days
  const [startDate, setStartDate] = useState<Date>(subDays(startOfDay(new Date()), 30));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    const [salesData, pnlData] = await Promise.all([
      reportService.getSales(startDate, endDate),
      reportService.getPnL(startDate, endDate)
    ]);
    setSales(salesData);
    setPnl(pnlData);
  };

  const exportCSV = () => {
    if (!sales || !pnl) return;
    const headers = ['Metric,Value\n'];
    const rows = [
      `Tong Doanh Thu,${sales.totalRevenue}`,
      `Tong Giam Gia,${sales.totalDiscount}`,
      `Tong Phu Thu,${sales.totalSurcharge}`,
      `Tong VAT,${sales.totalVAT}`,
      `Gia Von Hang Ban,${sales.totalCost}`,
      `Lai Gop,${sales.grossProfit}`,
      `Tong Chi Phi,${pnl.expenses.total}`,
      `Thu Nhap Khac,${pnl.otherRevenue}`,
      `Lai Lo Thuan,${pnl.netIncome}`,
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_tai_chinh_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!sales || !pnl) return <div>Đang tải dữ liệu...</div>;

  const expenseData = Object.entries(pnl.expenses.breakdown).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Báo cáo Tài chính & Lãi lỗ</h1>
        <Button variant="outline" onClick={exportCSV}>Xuất CSV</Button>
      </div>

      {/* Tóm tắt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Tổng doanh thu</div>
            <div className="text-2xl font-bold text-primary">{sales.totalRevenue.toLocaleString()} đ</div>
            <div className="text-sm text-muted mt-2">{sales.totalOrders} đơn hàng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Lãi gộp (Gross Profit)</div>
            <div className="text-2xl font-bold text-success">{sales.grossProfit.toLocaleString()} đ</div>
            <div className="text-sm text-muted mt-2">Giá vốn: {sales.totalCost.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted mb-1">Tổng chi phí vận hành</div>
            <div className="text-2xl font-bold text-error">{pnl.expenses.total.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card className="bg-ink text-canvas">
          <CardContent className="p-5">
            <div className="text-sm opacity-80 mb-1">Lãi/Lỗ thuần (Net Income)</div>
            <div className={`text-2xl font-bold ${pnl.netIncome >= 0 ? 'text-success' : 'text-error'}`}>
              {pnl.netIncome.toLocaleString()} đ
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bổ chi phí */}
        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu chi phí</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                    {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString() + ' đ'} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">Chưa có dữ liệu chi phí</div>
            )}
          </CardContent>
        </Card>

        {/* Top món bán chạy */}
        <Card>
          <CardHeader>
            <CardTitle>Top món đóng góp doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(sales.itemSales)
                .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
                .slice(0, 5)
                .map(([name, data]: any, idx) => (
                  <div key={name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-muted">{idx + 1}</span>
                      <span className="font-medium text-ink">{name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{data.revenue.toLocaleString()} đ</div>
                      <div className="text-xs text-muted">{data.quantity} lượt gọi</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
