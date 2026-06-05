import React, { useEffect, useState } from 'react';
import { menuService } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

export function Menu() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    menuService.getItems().then(setItems);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Thực đơn</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên món</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name}</TableCell>
                  <TableCell>{item.price.toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'outline'}>
                      {item.status}
                    </Badge>
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
