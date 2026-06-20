import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  PackageCheck,
  Truck,
  AlertTriangle,
  PackagePlus,
  Layers,
  Boxes,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductService } from '@/services/product-service';
import { StorageService } from '@/services/storage-service';
import { InventoryInputService } from '@/services/inventory-input-service';
import { AddStockInputDialog } from '@/components/inventory/AddStockInputDialog';
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts';
import { RecentInputsList } from '@/components/inventory/RecentInputsList';
import { ExpiringBatchesList } from '@/components/inventory/ExpiringBatchesList';
import { toPersianDigits } from '@/lib/persian-date';

export default function Inventory() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preselectedProduct, setPreselectedProduct] = useState<number | undefined>();

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => ProductService.getAll() });
  const { data: spaces = [] } = useQuery({ queryKey: ['storage', 'spaces'], queryFn: () => StorageService.getSpaces() });
  const { data: recentInputs = [] } = useQuery({
    queryKey: ['stock-inputs', 'recent'],
    queryFn: () => InventoryInputService.getRecent(50),
  });

  const totalStock = products.reduce((s, p) => s + (p.stockQuantity ?? p.stock?.quantity ?? 0), 0);
  const lowStockCount = products.filter((p) => {
    const qty = p.stockQuantity ?? p.stock?.quantity ?? 0;
    const threshold = p.reorderLevel ?? p.stock?.reorderThreshold ?? 5;
    return qty <= threshold;
  }).length;

  const openDialog = (productId?: number) => {
    setPreselectedProduct(productId);
    setDialogOpen(true);
  };

  const kpis = [
    {
      title: 'کل موجودی',
      value: toPersianDigits(totalStock),
      icon: Box,
      onClick: () => navigate('/products'),
      accent: 'bg-primary/10 text-primary',
    },
    {
      title: 'فضاهای انبار',
      value: toPersianDigits(spaces.length),
      icon: PackageCheck,
      onClick: () => navigate('/inventory/storage'),
      accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'ورودی‌های اخیر',
      value: toPersianDigits(recentInputs.length),
      icon: Truck,
      onClick: () => navigate('/inventory/inputs'),
      accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'کمبود موجودی',
      value: toPersianDigits(lowStockCount),
      icon: AlertTriangle,
      onClick: () => navigate('/inventory/locations'),
      accent: 'bg-destructive/10 text-destructive',
    },
  ];

  const quickLinks = [
    { label: 'فضاهای ذخیره‌سازی', icon: PackageCheck, path: '/inventory/storage' },
    { label: 'بخش‌ها و قفسه‌ها', icon: Layers, path: '/inventory/storage' },
    { label: 'لیست ورودی‌ها', icon: Truck, path: '/inventory/inputs' },
    { label: 'مکان‌های انبار', icon: Boxes, path: '/inventory/locations' },
  ];

  return (
    <div className="space-y-6 py-6" dir="rtl">
      {/* Hero header */}
      <div className="rounded-2xl border bg-gradient-to-bl from-primary/10 via-background to-accent/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">مدیریت انبار</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              برای شارژ مجدد یک محصول موجود (مثل ورود محموله جدید کوکاکولا یا آیفون)، روی «ثبت ورود کالا» بزنید.
              تاریخچه و قیمت سری‌های قبلی حفظ می‌شود و سری جدید با قیمت خودش ثبت می‌گردد.
            </p>
          </div>
          <Button size="lg" onClick={() => openDialog()} className="gap-2 shadow-md">
            <PackagePlus className="h-5 w-5" />
            ثبت ورود کالا
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card
            key={k.title}
            onClick={k.onClick}
            className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${k.accent}`}>
                  <k.icon className="h-5 w-5" />
                </span>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-bold">{k.value}</div>
              <div className="text-sm text-muted-foreground">{k.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts onRecharge={openDialog} />
        <RecentInputsList />
        <ExpiringBatchesList />

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">دسترسی سریع</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickLinks.map((q) => (
              <Button
                key={q.label}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(q.path)}
              >
                <q.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{q.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <AddStockInputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultProductId={preselectedProduct}
      />
    </div>
  );
}
