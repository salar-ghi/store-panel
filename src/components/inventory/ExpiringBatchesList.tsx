// Batches close to expiry — colored badge shows urgency.

import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryInputService } from '@/services/inventory-input-service';
import { formatPersianDateShort, toPersianDigits } from '@/lib/persian-date';

function daysLeft(iso?: string): number {
  if (!iso) return Infinity;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function ExpiringBatchesList() {
  const { data: inputs = [], isLoading } = useQuery({
    queryKey: ['stock-inputs', 'expiring'],
    queryFn: () => InventoryInputService.getExpiring(30),
  });

  const sorted = [...inputs]
    .filter((b) => b.expiryDate)
    .sort((a, b) => daysLeft(a.expiryDate) - daysLeft(b.expiryDate))
    .slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </span>
          نزدیک به انقضا
        </CardTitle>
        <Badge variant="outline" className="text-xs">{toPersianDigits(sorted.length)}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : sorted.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            محصولی نزدیک به انقضا نیست
          </div>
        ) : (
          sorted.map((b) => {
            const d = daysLeft(b.expiryDate);
            const variant: 'destructive' | 'default' | 'secondary' =
              d <= 3 ? 'destructive' : d <= 14 ? 'default' : 'secondary';
            return (
              <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{b.productName || `محصول #${b.productId}`}</div>
                  <div className="text-xs text-muted-foreground">
                    سری {b.batchNumber} · انقضا: {formatPersianDateShort(b.expiryDate)}
                  </div>
                </div>
                <Badge variant={variant} className="shrink-0">
                  {d < 0 ? 'منقضی شده' : `${toPersianDigits(d)} روز`}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
