import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Truck, Filter, PackagePlus, Search, Loader2 } from 'lucide-react';
import { InventoryInputService } from '@/services/inventory-input-service';
import { ProductService } from '@/services/product-service';
import { SupplierService } from '@/services/supplier-service';
import { AddStockInputDialog } from '@/components/inventory/AddStockInputDialog';
import { toPersianDigits } from '@/lib/persian-date';
import { formatNumber } from '@/lib/format';

export default function InventoryInputs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  const { data: inputs = [], isLoading } = useQuery({
    queryKey: ['stock-inputs', 'all'],
    queryFn: () => InventoryInputService.getAll(),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inputs.filter((r) => {
      if (productFilter !== 'all' && String(r.productId) !== productFilter) return false;
      if (supplierFilter !== 'all' && String(r.supplierId ?? '') !== supplierFilter) return false;
      if (!q) return true;
      return (
        r.batchNumber?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q) ||
        r.supplierName?.toLowerCase().includes(q)
      );
    });
  }, [inputs, search, productFilter, supplierFilter]);

  const totals = useMemo(() => {
    const qty = filtered.reduce((s, r) => s + (r.quantity ?? 0), 0);
    const cost = filtered.reduce((s, r) => s + (r.costPrice ?? 0) * (r.quantity ?? 0), 0);
    return { qty, cost, count: filtered.length };
  }, [filtered]);

  return (
    <div className="space-y-6 py-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لیست ورودی‌های انبار</h1>
          <p className="text-muted-foreground mt-1">
            تاریخچه کامل شارژ‌های موجودی. هر ورود کالا با شماره سری، قیمت خرید و فروش خاص خود ثبت می‌شود.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2 shadow-md">
          <PackagePlus className="h-5 w-5" />
          ثبت ورود کالا
        </Button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">تعداد ورودی‌ها</div>
              <div className="text-2xl font-bold mt-1">{toPersianDigits(totals.count)}</div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">مجموع اقلام</div>
              <div className="text-2xl font-bold mt-1">{toPersianDigits(totals.qty)}</div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PackagePlus className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">ارزش خرید</div>
              <div className="text-2xl font-bold mt-1">{formatNumber(totals.cost)}</div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-base">فیلترها</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-8 sm:w-64"
                placeholder="جستجو در سری، محصول، تامین‌کننده..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="محصول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه محصولات</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="تامین‌کننده" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه تامین‌کنندگان</SelectItem>
                {suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره سری</TableHead>
                  <TableHead>محصول</TableHead>
                  <TableHead>تامین‌کننده</TableHead>
                  <TableHead>مکان</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>قیمت خرید</TableHead>
                  <TableHead>قیمت فروش</TableHead>
                  <TableHead>تاریخ ورود</TableHead>
                  <TableHead>انقضا</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      هیچ ورودی‌ای یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.batchNumber}</TableCell>
                      <TableCell>{r.productName ?? `#${r.productId}`}</TableCell>
                      <TableCell>{r.supplierName ?? '—'}</TableCell>
                      <TableCell className="text-xs">
                        {[r.spaceName, r.zoneName, r.shelfCode].filter(Boolean).join(' / ') || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{toPersianDigits(r.quantity)}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(r.costPrice)}</TableCell>
                      <TableCell>{formatNumber(r.salePrice)}</TableCell>
                      <TableCell className="text-xs">
                        {r.receivedDate ? new Date(r.receivedDate).toLocaleDateString('fa-IR') : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('fa-IR') : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddStockInputDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
