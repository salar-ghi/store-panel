// Recent stock inputs feed (last 10 batches added across all products).

import { useQuery } from '@tanstack/react-query';
import { PackagePlus, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryInputService } from '@/services/inventory-input-service';
import { formatPersianDateShort, toPersianDigits } from '@/lib/persian-date';

export function RecentInputsList() {
  const { data: inputs = [], isLoading } = useQuery({
    queryKey: ['stock-inputs', 'recent'],
    queryFn: () => InventoryInputService.getRecent(10),
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PackagePlus className="h-4 w-4" />
          </span>
          آخرین ورودی‌های انبار
        </CardTitle>
        <Badge variant="secondary" className="text-xs">{toPersianDigits(inputs.length)}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : inputs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            هنوز ورودی‌ای ثبت نشده است
          </div>
        ) : (
          inputs.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{b.productName || `محصول #${b.productId}`}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{b.batchNumber}</span>
                  {b.supplierName && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{b.supplierName}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-semibold text-primary">+{toPersianDigits(b.quantity)}</div>
                <div className="text-xs text-muted-foreground">{formatPersianDateShort(b.receivedDate)}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
