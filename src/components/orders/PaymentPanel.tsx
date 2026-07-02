import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  OrderDiscount,
  OrderPaymentMethod,
  PaymentMethodLabels,
  PaymentSplit,
  PaymentStatus,
} from '@/types/payment';
import { OrderItem } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Plus, Trash2, Wallet, AlertCircle, CheckCircle2, Ticket, X } from 'lucide-react';
import { PriceInput } from '@/components/ui/price-input';
import { formatPrice } from '@/lib/format';
import { PromotionService } from '@/services/promotion-service';
import { evaluateDiscount, DiscountScopeLabels } from '@/lib/discount-eval';
import type { Discount } from '@/types/promotion';
import { toast } from 'sonner';

interface PaymentPanelProps {
  subtotal: number;
  discount: OrderDiscount;
  onDiscountChange: (d: OrderDiscount) => void;
  payments: PaymentSplit[];
  onPaymentsChange: (p: PaymentSplit[]) => void;
  /** Context needed to validate promotion codes against their scope. */
  items?: OrderItem[];
  customerId?: string;
  customerRoleIds?: string[];
}

export function computeDiscountAmount(subtotal: number, d: OrderDiscount) {
  if (!d?.value || d.value <= 0) return 0;
  if (d.type === 'percent') {
    return Math.max(0, Math.round((subtotal * Math.min(d.value, 100)) / 100));
  }
  return Math.min(subtotal, Math.round(d.value));
}

export function computePaymentStatus(
  finalTotal: number,
  payments: PaymentSplit[],
): PaymentStatus {
  const paid = payments
    .filter((p) => p.method !== 'credit')
    .reduce((s, p) => s + (p.amount || 0), 0);
  if (paid <= 0) return 'unpaid';
  if (paid >= finalTotal) return 'paid';
  return 'partial';
}

const METHODS: OrderPaymentMethod[] = [
  'cash',
  'card',
  'online_gateway',
  'bank_transfer',
  'wallet',
  'cheque',
  'credit',
];

export function PaymentPanel({
  subtotal,
  discount,
  onDiscountChange,
  payments,
  onPaymentsChange,
  items = [],
  customerId,
  customerRoleIds = [],
}: PaymentPanelProps) {
  const discountAmount = computeDiscountAmount(subtotal, discount);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const allocated = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = finalTotal - allocated;

  const paymentStatus = useMemo(
    () => computePaymentStatus(finalTotal, payments),
    [finalTotal, payments],
  );

  // --- Promotion code apply ---
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Discount | null>(null);

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => PromotionService.getAllDiscounts(),
    staleTime: 60 * 1000,
  });

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return;
    const d = discounts.find((x) => x.code.toLowerCase() === code.toLowerCase());
    if (!d) {
      toast.error('کد تخفیف نامعتبر است');
      return;
    }
    const res = evaluateDiscount(d, {
      items,
      subtotal,
      customerId,
      customerRoleIds,
    });
    if (!res.eligible) {
      toast.error(res.reason ?? 'این کد تخفیف قابل اعمال نیست');
      return;
    }
    setAppliedCoupon(d);
    // Apply as a fixed-amount discount so the computed value is preserved
    // (percent + scope makes it a variable calculation, so we lock in the toman amount).
    onDiscountChange({ type: 'amount', value: res.amount });
    toast.success(`کد «${d.code}» اعمال شد — ${formatPrice(res.amount)} تخفیف`);
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    onDiscountChange({ type: 'percent', value: 0 });
  };

  const addSplit = (preset?: Partial<PaymentSplit>) => {
    const split: PaymentSplit = {
      id: crypto.randomUUID(),
      method: preset?.method ?? 'cash',
      amount: preset?.amount ?? Math.max(0, remaining),
      ...preset,
    };
    onPaymentsChange([...payments, split]);
  };

  const updateSplit = (id: string, patch: Partial<PaymentSplit>) => {
    onPaymentsChange(payments.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const removeSplit = (id: string) =>
    onPaymentsChange(payments.filter((p) => p.id !== id));

  const fillRemaining = (method: OrderPaymentMethod) => {
    if (remaining <= 0) return;
    addSplit({ method, amount: remaining });
  };

  return (
    <div className="space-y-4">
      {/* --- Coupon code --- */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">کد تخفیف</p>
        </div>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg border border-success/40 bg-success/10 p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground">
                  {appliedCoupon.code}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {DiscountScopeLabels[appliedCoupon.scope?.type ?? 'all']}
                </span>
              </div>
              <p className="text-xs text-success">
                تخفیف اعمال‌شده: {formatPrice(discountAmount)}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearCoupon}
              className="text-destructive"
            >
              <X className="ml-1 h-3.5 w-3.5" />
              حذف کد
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              dir="ltr"
              placeholder="مثال: SUMMER50"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
            />
            <Button type="button" onClick={applyCoupon} variant="outline">
              اعمال
            </Button>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          کدهای تخفیف بر اساس محدوده تعریف‌شده (دسته، برند، محصول، کاربر یا گروه کاربری) اعتبارسنجی می‌شوند.
        </p>
      </Card>


      {/* --- Discount card --- */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">تخفیف سفارش</Label>
          <Tabs
            value={discount.type}
            onValueChange={(v) =>
              onDiscountChange({ type: v as 'percent' | 'amount', value: 0 })
            }
          >
            <TabsList className="h-8">
              <TabsTrigger value="percent" className="text-xs">
                درصدی
              </TabsTrigger>
              <TabsTrigger value="amount" className="text-xs">
                مبلغ ثابت
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {discount.type === 'percent' ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                درصد تخفیف (۰ تا ۱۰۰)
              </Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                max={100}
                value={discount.value || ''}
                onChange={(e) =>
                  onDiscountChange({
                    type: 'percent',
                    value: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">مبلغ تخفیف</Label>
              <PriceInput
                value={discount.value}
                onChange={(n) => onDiscountChange({ type: 'amount', value: n })}
                suffix="تومان"
              />
            </div>
          )}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">جمع کل</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>تخفیف</span>
              <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
              <span>مبلغ قابل پرداخت</span>
              <span className="tabular-nums">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* --- Payment splits --- */}
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">روش‌های پرداخت</p>
          </div>
          <div className="flex items-center gap-2">
            {paymentStatus === 'paid' && (
              <Badge className="gap-1 bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3" />
                تسویه کامل
              </Badge>
            )}
            {paymentStatus === 'partial' && (
              <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
                <AlertCircle className="h-3 w-3" />
                باقی‌مانده {formatPrice(remaining > 0 ? remaining : 0)}
              </Badge>
            )}
            {paymentStatus === 'unpaid' && (
              <Badge
                variant="outline"
                className="gap-1 border-destructive/40 text-destructive"
              >
                <AlertCircle className="h-3 w-3" />
                پرداخت نشده
              </Badge>
            )}
            {remaining < 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-destructive/40 text-destructive"
              >
                مازاد {formatPrice(Math.abs(remaining))}
              </Badge>
            )}
          </div>
        </div>

        {payments.length === 0 && (
          <div className="space-y-2 rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              هنوز روش پرداختی اضافه نشده است. می‌توانید پرداخت را ترکیبی (نقد + کارت + بدهی) ثبت کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {(['cash', 'card', 'online_gateway', 'credit'] as OrderPaymentMethod[]).map(
                (m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fillRemaining(m)}
                  >
                    <Plus className="ml-1 h-3.5 w-3.5" />
                    {PaymentMethodLabels[m]}
                  </Button>
                ),
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {payments.map((p, idx) => {
            const needsGatewayId =
              p.method === 'card' || p.method === 'online_gateway';
            const isCredit = p.method === 'credit';
            return (
              <div
                key={p.id}
                className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1.2fr_1fr_1.4fr_auto]"
              >
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    روش #{idx + 1}
                  </Label>
                  <Select
                    value={p.method}
                    onValueChange={(v) =>
                      updateSplit(p.id, { method: v as OrderPaymentMethod })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {PaymentMethodLabels[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">مبلغ</Label>
                  <PriceInput
                    value={p.amount}
                    onChange={(n) => updateSplit(p.id, { amount: n })}
                    suffix="تومان"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    {needsGatewayId
                      ? 'کد پیگیری / شناسه تراکنش *'
                      : isCredit
                      ? 'تاریخ سررسید'
                      : 'توضیح / مرجع (اختیاری)'}
                  </Label>
                  {isCredit ? (
                    <Input
                      type="date"
                      dir="ltr"
                      value={p.dueDate ?? ''}
                      onChange={(e) =>
                        updateSplit(p.id, { dueDate: e.target.value })
                      }
                    />
                  ) : needsGatewayId ? (
                    <Input
                      dir="ltr"
                      placeholder="مثال: 845721369"
                      value={p.gatewayTxnId ?? ''}
                      onChange={(e) =>
                        updateSplit(p.id, { gatewayTxnId: e.target.value })
                      }
                    />
                  ) : (
                    <Input
                      value={p.reference ?? ''}
                      onChange={(e) =>
                        updateSplit(p.id, { reference: e.target.value })
                      }
                      placeholder="اختیاری"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="self-end text-destructive hover:text-destructive"
                  onClick={() => removeSplit(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {payments.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSplit()}
            >
              <Plus className="ml-1 h-3.5 w-3.5" />
              افزودن روش پرداخت
            </Button>
            {remaining > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">
                  باقی‌مانده را به این روش اختصاص بده:
                </span>
                {(['cash', 'card', 'credit'] as OrderPaymentMethod[]).map((m) => (
                  <Badge
                    key={m}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => fillRemaining(m)}
                  >
                    + {PaymentMethodLabels[m]}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
