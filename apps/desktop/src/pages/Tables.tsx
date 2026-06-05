import React, { useEffect, useState } from 'react';
import { tableService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { translateStatus } from '../lib/statusLabels';

export function Tables() {
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    tableService.getAreas().then(setAreas);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Quản lý Bàn và Khu vực</h1>
      {areas.map(area => (
        <div key={area.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{area.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {area.tables.map((table: any) => (
              <Card key={table.id} className="cursor-pointer hover:shadow-soft transition-shadow border border-transparent hover:border-primary/20">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-surface-soft flex items-center justify-center font-bold text-lg text-primary">
                    {table.name.replace('Bàn ', '')}
                  </div>
                  <span className="font-medium text-ink">{table.name}</span>
                  <Badge variant={table.status === 'AVAILABLE' ? 'outline' : table.status === 'OCCUPIED' ? 'error' : 'default'}>
                    {translateStatus(table.status)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
