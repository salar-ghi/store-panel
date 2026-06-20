// Products whose remaining stock is below their reorder threshold.
// One-click "شارژ" opens AddStockInputDialog with the product pre-selected.

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductService } from '@/services/product-service';
import { toPersianDigits } from '@/lib/persian-date';

interface LowStockAlertsProps {
  onRecharge: (productId: number) => void;
}

export function LowStockAlerts({ onRecharge }: LowStockAlertsProps) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
  });

  const lowStock = products
    .filter((p) => {
      const qty = p.stockQuantity ?? p.stock?.quantity ?? 0;
      const threshold = p.reorderLevel ?? p.stock?.reorderThreshold ?? 5;
      return qty <= threshold;
    })
    .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
    .slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          هشدار کمبود موجودی
        </CardTitle>
        <Badge variant="destructive" className="text-xs">
          {toPersianDigits(lowStock.length)} مورد
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : lowStock.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            هیچ محصولی در آستانه‌ی کمبود نیست
          </div>
        ) : (
          lowStock.map((p) => {
            const qty = p.stockQuantity ?? p.stock?.quantity ?? 0;
            const threshold = p.reorderLevel ?? p.stock?.reorderThreshold ?? 5;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    موجودی: <span className="text-destructive font-semibold">{toPersianDigits(qty)}</span>{' '}
                    / آستانه: {toPersianDigits(threshold)}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => onRecharge(p.id)}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  شارژ
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
