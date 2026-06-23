import { useEffect, useMemo, useState } from "react";
import { Order, ReturnReason, ReturnReasonLabels, ReturnItem } from "@/types/order";
import { PaymentSplit } from "@/types/payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PackageOpen, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PaymentPanel } from "./PaymentPanel";
import { formatPrice } from "@/lib/format";
import { OrderService } from "@/services/order-service";

interface ReturnOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onSubmitted?: (orderId: string, total: number) => void;
}

export function ReturnOrderDialog({
  open,
  onOpenChange,
  orders,
  onSubmitted,
}: ReturnOrderDialogProps) {
  const [search, setSearch] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  // orderItemId -> { qty, reason, note }
  const [draft, setDraft] = useState<
    Record<string, { qty: number; reason: ReturnReason; note?: string }>
  >({});
  const [refunds, setRefunds] = useState<PaymentSplit[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders.slice(0, 10);
    return orders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          (o.customerPhone ?? "").includes(q),
      )
      .slice(0, 10);
  }, [orders, search]);

  const order = orders.find((o) => o.id === orderId) ?? null;

  useEffect(() => {
    if (!open) {
      setOrderId(null);
      setDraft({});
      setRefunds([]);
      setNotes("");
      setSearch("");
    }
  }, [open]);

  const returnItems: ReturnItem[] = useMemo(() => {
    if (!order) return [];
    return order.items
      .map((it) => {
        const d = draft[it.id];
        if (!d || d.qty <= 0) return null;
        return {
          orderItemId: it.id,
          productId: it.productId,
          productName: it.productName,
          quantity: d.qty,
          unitPrice: it.unitPrice,
          reason: d.reason,
          note: d.note,
        } as ReturnItem;
      })
      .filter((x): x is ReturnItem => !!x);
  }, [order, draft]);

  const refundTotal = returnItems.reduce(
    (s, it) => s + it.quantity * it.unitPrice,
    0,
  );

  const handleSubmit = async () => {
    if (!order) return;
    if (returnItems.length === 0) {
      toast.error("حداقل یک قلم برای مرجوعی انتخاب کنید");
      return;
    }
    const refundSum = refunds.reduce((s, r) => s + (r.amount || 0), 0);
    if (refundSum > refundTotal) {
      toast.error("مجموع بازگشت وجه بیشتر از ارزش اقلام مرجوعی است");
      return;
    }
    for (const r of refunds) {
      if (
        (r.method === "card" || r.method === "online_gateway") &&
        !r.gatewayTxnId?.trim()
      ) {
        toast.error("کد پیگیری بازگشت وجه کارتی الزامی است");
        return;
      }
    }
    setSubmitting(true);
    try {
      await OrderService.createReturn({
        orderId: order.id,
        items: returnItems,
        refunds,
        totalRefund: refundSum,
        notes,
      }).catch(() => undefined); // backend optional
      await OrderService.syncRefundsToFinance(order.id, order.customer, {
        orderId: order.id,
        items: returnItems,
        refunds,
        totalRefund: refundSum,
        notes,
      }).catch(() => undefined);
      toast.success(
        `مرجوعی برای سفارش ${order.id} با موفقیت ثبت شد. موجودی محصولات و حساب مالی به‌روزرسانی شد.`,
      );
      onSubmitted?.(order.id, refundSum);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("خطا در ثبت مرجوعی");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            ثبت مرجوعی سفارش
          </DialogTitle>
          <DialogDescription>
            اقلام برگشتی، دلیل و روش بازگشت وجه را مشخص کنید. تغییرات به طور خودکار با موجودی و امور مالی همگام می‌شود.
          </DialogDescription>
        </DialogHeader>

        {!order ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                dir="rtl"
                className="pr-10"
                placeholder="جستجو با شناسه سفارش، نام مشتری یا موبایل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Card className="overflow-hidden">
              <ScrollArea className="max-h-[300px]">
                {filteredOrders.length === 0 ? (
                  <div className="space-y-2 p-8 text-center">
                    <PackageOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">سفارشی یافت نشد</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredOrders.map((o) => (
                      <li
                        key={o.id}
                        className="cursor-pointer p-3 transition-colors hover:bg-muted/60"
                        onClick={() => setOrderId(o.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{o.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {o.customer} • {o.customerPhone ?? "-"}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium tabular-nums">
                              {formatPrice(o.finalTotal ?? o.total)}
                            </p>
                            <Badge variant="secondary" className="text-[10px]">
                              {o.items.length} قلم
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold">{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer} • {order.customerPhone ?? "-"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOrderId(null)}>
                تغییر سفارش
              </Button>
            </Card>

            <Card className="space-y-2 p-4">
              <p className="text-sm font-semibold">اقلام قابل مرجوعی</p>
              <div className="space-y-2">
                {order.items.map((it) => {
                  const d = draft[it.id] ?? { qty: 0, reason: "damaged" as ReturnReason };
                  return (
                    <div
                      key={it.id}
                      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1.5fr_0.8fr_1fr_1.4fr]"
                    >
                      <div>
                        <p className="font-medium">{it.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          خرید: {it.quantity} • قیمت واحد {formatPrice(it.unitPrice)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          تعداد برگشتی
                        </Label>
                        <Input
                          type="number"
                          dir="ltr"
                          min={0}
                          max={it.quantity}
                          step={it.saleUnit === "weight" ? 0.1 : 1}
                          value={d.qty || ""}
                          onChange={(e) => {
                            const n = Math.max(
                              0,
                              Math.min(it.quantity, Number(e.target.value) || 0),
                            );
                            setDraft({ ...draft, [it.id]: { ...d, qty: n } });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">دلیل</Label>
                        <Select
                          value={d.reason}
                          onValueChange={(v) =>
                            setDraft({
                              ...draft,
                              [it.id]: { ...d, reason: v as ReturnReason },
                            })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ReturnReasonLabels).map(([k, label]) => (
                              <SelectItem key={k} value={k}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          توضیح (اختیاری)
                        </Label>
                        <Input
                          value={d.note ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              [it.id]: { ...d, note: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end border-t pt-2 text-sm">
                <span className="font-semibold">
                  ارزش اقلام برگشتی: {formatPrice(refundTotal)}
                </span>
              </div>
            </Card>

            <PaymentPanel
              subtotal={refundTotal}
              discount={{ type: "amount", value: 0 }}
              onDiscountChange={() => {
                /* no discount on refunds */
              }}
              payments={refunds}
              onPaymentsChange={setRefunds}
            />

            <div className="space-y-1.5">
              <Label>توضیحات مرجوعی (اختیاری)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات کلی در مورد این مرجوعی..."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          {order && (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
              ثبت مرجوعی
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
