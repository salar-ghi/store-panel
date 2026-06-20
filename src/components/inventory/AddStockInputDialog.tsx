// Add Stock Input — opens a single dialog used everywhere a user needs to
// register a new batch for an EXISTING product (restock / recharge).
// Never creates a new product; product is picked from the existing catalogue.

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, PackagePlus, Search, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PersianDatePicker } from '@/components/ui/persian-datepicker';

import { ProductService } from '@/services/product-service';
import { SupplierService } from '@/services/supplier-service';
import { StorageService } from '@/services/storage-service';
import { InventoryInputService } from '@/services/inventory-input-service';
import { CreateStockInputRequest } from '@/types/inventory-input';
import { toPersianDigits } from '@/lib/persian-date';

const schema = z.object({
  productId: z.coerce.number().int().positive({ message: 'محصول را انتخاب کنید' }),
  batchNumber: z.string().min(2, { message: 'شماره سری الزامی است' }),
  quantity: z.coerce.number().positive({ message: 'تعداد باید بیشتر از صفر باشد' }),
  costPrice: z.coerce.number().nonnegative({ message: 'قیمت خرید نمی‌تواند منفی باشد' }),
  salePrice: z.coerce.number().nonnegative({ message: 'قیمت فروش نمی‌تواند منفی باشد' }),
  currency: z.string().default('IRR'),
  supplierId: z.coerce.number().int().positive().optional(),
  spaceId: z.coerce.number().int().positive().optional(),
  shelfId: z.coerce.number().int().positive().optional(),
  receivedDate: z.date({ required_error: 'تاریخ ورود الزامی است' }),
  expiryDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddStockInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a product (used from low-stock alerts / product detail page) */
  defaultProductId?: number;
}

export function AddStockInputDialog({ open, onOpenChange, defaultProductId }: AddStockInputDialogProps) {
  const qc = useQueryClient();
  const [productSearch, setProductSearch] = useState('');

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
    enabled: open,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll(),
    enabled: open,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ['storage', 'spaces'],
    queryFn: () => StorageService.getSpaces(),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: defaultProductId ?? 0,
      batchNumber: '',
      quantity: 1,
      costPrice: 0,
      salePrice: 0,
      currency: 'IRR',
      receivedDate: new Date(),
      notes: '',
    },
  });

  const watchedProductId = form.watch('productId');
  const watchedSpaceId = form.watch('spaceId');

  const { data: shelves = [] } = useQuery({
    queryKey: ['storage', 'shelves', watchedSpaceId],
    queryFn: () => StorageService.getShelves({ spaceId: watchedSpaceId }),
    enabled: !!watchedSpaceId,
  });

  // Auto-suggest a batch number whenever the chosen product changes
  useEffect(() => {
    if (watchedProductId && !form.getValues('batchNumber')) {
      form.setValue('batchNumber', InventoryInputService.suggestBatchNumber(watchedProductId));
    }
  }, [watchedProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && defaultProductId) {
      form.setValue('productId', defaultProductId);
      form.setValue('batchNumber', InventoryInputService.suggestBatchNumber(defaultProductId));
    }
    if (!open) {
      form.reset({
        productId: 0,
        batchNumber: '',
        quantity: 1,
        costPrice: 0,
        salePrice: 0,
        currency: 'IRR',
        receivedDate: new Date(),
        notes: '',
      });
      setProductSearch('');
    }
  }, [open, defaultProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === Number(watchedProductId)),
    [products, watchedProductId],
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 50);
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 50);
  }, [products, productSearch]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateStockInputRequest) => InventoryInputService.create(payload),
    onSuccess: () => {
      toast.success('ورود کالا با موفقیت ثبت شد');
      qc.invalidateQueries({ queryKey: ['stock-inputs'] });
      qc.invalidateQueries({ queryKey: ['stock-inputs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['stock-inputs', 'expiring'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'ثبت ورود کالا با خطا مواجه شد');
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: CreateStockInputRequest = {
      productId: values.productId,
      batchNumber: values.batchNumber,
      quantity: values.quantity,
      costPrice: values.costPrice,
      salePrice: values.salePrice,
      currency: values.currency || 'IRR',
      supplierId: values.supplierId,
      spaceId: values.spaceId,
      shelfId: values.shelfId,
      receivedDate: values.receivedDate.toISOString(),
      expiryDate: values.expiryDate?.toISOString(),
      notes: values.notes,
    };
    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PackagePlus className="h-5 w-5" />
            </span>
            ثبت ورود کالا به انبار
          </DialogTitle>
          <DialogDescription>
            برای شارژ مجدد یک محصول موجود، اطلاعات سری جدید را وارد کنید. محصول جدید ساخته نمی‌شود.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Product picker */}
            <Card className="border-r-4 border-r-primary/70">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel className="text-base">۱. محصول</FormLabel>
                  {selectedProduct && (
                    <Badge variant="secondary" className="gap-1">
                      موجودی فعلی: {toPersianDigits(selectedProduct.stockQuantity ?? 0)}
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجوی محصول..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pr-9"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب محصول" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredProducts.length === 0 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground">محصولی یافت نشد</div>
                          )}
                          {filteredProducts.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              <div className="flex flex-col text-right">
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  موجودی: {toPersianDigits(p.stockQuantity ?? 0)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProduct && (
                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                    <span>
                      این یک سری <strong>جدید</strong> برای «{selectedProduct.name}» است. تاریخچه و موجودی سری‌های قبلی حفظ می‌شود.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Batch + quantity + prices */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="text-base font-medium">۲. اطلاعات سری و قیمت</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره سری</FormLabel>
                        <FormControl>
                          <Input placeholder="B-..." {...field} />
                        </FormControl>
                        <FormDescription>برای تفکیک ورودی‌های مختلف یک محصول</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تعداد ورودی</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قیمت خرید (هر واحد)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قیمت فروش (هر واحد)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد پول</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IRR">ریال (IRR)</SelectItem>
                            <SelectItem value="USD">دلار (USD)</SelectItem>
                            <SelectItem value="EUR">یورو (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier + location + dates */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="text-base font-medium">۳. تامین‌کننده، محل نگهداری و تاریخ‌ها</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تامین‌کننده (اختیاری)</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب تامین‌کننده" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.companyName || s.name || `تامین‌کننده ${s.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فضای انبار (اختیاری)</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v ? Number(v) : undefined);
                            form.setValue('shelfId', undefined);
                          }}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب فضا" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {spaces.map((sp) => (
                              <SelectItem key={sp.id} value={String(sp.id)}>
                                {sp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shelfId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قفسه (اختیاری)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                        value={field.value ? String(field.value) : undefined}
                        disabled={!watchedSpaceId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={watchedSpaceId ? 'انتخاب قفسه' : 'ابتدا فضا را انتخاب کنید'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shelves.map((sh) => (
                            <SelectItem key={sh.id} value={String(sh.id)}>
                              {sh.code} {sh.name && `— ${sh.name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="receivedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          تاریخ ورود
                        </FormLabel>
                        <FormControl>
                          <PersianDatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          تاریخ انقضا (اختیاری)
                        </FormLabel>
                        <FormControl>
                          <PersianDatePicker value={field.value} onChange={field.onChange} placeholder="بدون انقضا" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>یادداشت</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="توضیحات اضافی..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                انصراف
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                <Plus className="h-4 w-4" />
                {createMutation.isPending ? 'در حال ثبت...' : 'ثبت ورود کالا'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
