import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { OrderDiscount, PaymentSplit } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSelector } from "./ProductSelector";
import { OrderItemsTable } from "./OrderItemsTable";
import { CustomerPicker, PickedCustomer } from "./CustomerPicker";
import {
  PaymentPanel,
  computeDiscountAmount,
  computePaymentStatus,
} from "./PaymentPanel";
import {
  Warehouse,
  User as UserIcon,
  ShoppingBasket,
  Wallet,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { StorageService } from "@/services/storage-service";
import { InventoryEngine, StockLocation } from "@/services/inventory-engine";
import { StorageSpaceTypeLabels } from "@/types/storage";
import { formatPrice } from "@/lib/format";
import { PaymentMethodLabels } from "@/types/payment";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  onSave: (order: Omit<Order, "id" | "date" | "status">) => void;
}

interface SelectedItem {
  quantity: number;
  shelfId?: number;
}

const STEPS = ["customer", "products", "payment", "summary"] as const;
type Step = (typeof STEPS)[number];

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  products,
  categories,
  brands,
  onSave,
}: OrderFormDialogProps) {
  const [step, setStep] = useState<Step>("customer");

  const [customerData, setCustomerData] = useState<PickedCustomer>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [scopeSpaceId, setScopeSpaceId] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(
    new Map()
  );
  const [locationsByProduct, setLocationsByProduct] = useState<
    Record<number, StockLocation[]>
  >({});
  const [availableMap, setAvailableMap] = useState<Record<number, number>>({});

  const [discount, setDiscount] = useState<OrderDiscount>({ type: "percent", value: 0 });
  const [payments, setPayments] = useState<PaymentSplit[]>([]);

  const isEditing = !!order;

  const { data: spaces = [] } = useQuery({
    queryKey: ["storage", "spaces"],
    queryFn: () => StorageService.getSpaces(),
  });

  const scope = useMemo(
    () => (scopeSpaceId > 0 ? { spaceId: scopeSpaceId } : undefined),
    [scopeSpaceId]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // Seed the inventory engine from the real product list before querying,
      // otherwise availableMap is empty and the product list is filtered out.
      await InventoryEngine.seed(products);
      const map = await InventoryEngine.getAvailableMap(
        products.map((p) => p.id),
        scope,
      );
      if (cancelled) return;
      // Fallback: when the engine has no per-shelf breakdown for a product
      // (no shelves configured, or no space scope selected), use the product's
      // own stock quantity so it can still be sold. When a specific space is
      // scoped, keep the engine's value (0 means "not stocked in that space").
      const merged: Record<number, number> = { ...map };
      for (const p of products) {
        const engineVal = merged[p.id];
        if (engineVal === undefined || (!scope && engineVal === 0)) {
          merged[p.id] = p.stock?.quantity ?? p.stockQuantity ?? 0;
        }
      }
      setAvailableMap(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, products, scope]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const ids = Array.from(selectedItems.keys());
    Promise.all(
      ids.map((pid) =>
        InventoryEngine.getLocations(pid, scope).then(
          (locs) => [pid, locs] as const
        )
      )
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<number, StockLocation[]> = {};
      entries.forEach(([pid, locs]) => (next[pid] = locs));
      setLocationsByProduct(next);
      setSelectedItems((prev) => {
        const updated = new Map(prev);
        let changed = false;
        for (const [pid, item] of updated) {
          const locs = next[pid] ?? [];
          const stillValid = item.shelfId
            ? locs.some((l) => l.shelfId === item.shelfId)
            : false;
          if (!stillValid) {
            const best =
              locs.find((l) => l.available >= item.quantity) ?? locs[0];
            updated.set(pid, { ...item, shelfId: best?.shelfId });
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open, scope, selectedItems.size]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    if (order) {
      const parts = order.customer.split(" ");
      setCustomerData({
        id: order.customerId,
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        phone: order.customerPhone ?? "",
      });
      setCustomerAddress(order.customerAddress || "");
      setNotes(order.notes || "");
      const map = new Map<number, SelectedItem>();
      order.items.forEach((item) => {
        map.set(item.productId, { quantity: item.quantity, shelfId: item.shelfId });
      });
      setSelectedItems(map);
      const firstSpace = order.items.find((i) => i.spaceId)?.spaceId;
      setScopeSpaceId(firstSpace ?? 0);
      setDiscount(order.discount ?? { type: "percent", value: 0 });
      setPayments(order.payments ?? []);
      setStep("customer");
    } else {
      setCustomerData({ firstName: "", lastName: "", phone: "" });
      setCustomerAddress("");
      setNotes("");
      setSelectedItems(new Map());
      setScopeSpaceId(0);
      setDiscount({ type: "percent", value: 0 });
      setPayments([]);
      setStep("customer");
    }
  }, [open, order]);

  const handleProductSelect = (productId: number, quantity: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(productId);
      } else {
        const prevItem = newMap.get(productId);
        newMap.set(productId, { quantity, shelfId: prevItem?.shelfId });
      }
      return newMap;
    });
  };

  const handleChangeShelf = (productId: number, shelfId: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const cur = newMap.get(productId);
      if (cur) newMap.set(productId, { ...cur, shelfId });
      return newMap;
    });
  };

  const orderItems: OrderItem[] = useMemo(() => {
    const items: OrderItem[] = [];
    selectedItems.forEach((sel, productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const locs = locationsByProduct[productId] ?? [];
      const loc = locs.find((l) => l.shelfId === sel.shelfId);
      const isWeight =
        product.salesUnit?.mode === "weight" || product.salesUnit?.mode === "both";
      const weightPrice = product.salesUnit?.pricePerWeightUnit;
      const price = isWeight && weightPrice ? weightPrice : product.price ?? 0;
      items.push({
        id: productId.toString(),
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        categoryName: product.categoryName || "",
        brandId: product.brandId,
        brandName: product.brandName || "",
        quantity: sel.quantity,
        saleUnit: isWeight ? "weight" : "piece",
        weightUnit: isWeight
          ? (product.salesUnit?.weightUnit as "gram" | "kilogram")
          : undefined,
        unitPrice: price,
        totalPrice: Math.round(price * sel.quantity),
        spaceId: loc?.spaceId,
        spaceName: loc?.spaceName,
        zoneId: loc?.zoneId,
        zoneName: loc?.zoneName,
        shelfId: loc?.shelfId,
        shelfCode: loc?.shelfCode,
      });
    });
    return items;
  }, [selectedItems, products, locationsByProduct]);

  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = computeDiscountAmount(subtotal, discount);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const allocated = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const paymentStatus = computePaymentStatus(finalTotal, payments);

  const handleRemoveItem = (productId: number) => handleProductSelect(productId, 0);

  const scopeLabel =
    scopeSpaceId > 0
      ? spaces.find((s) => s.id === scopeSpaceId)?.name
      : "همه فضاها";

  const stepIndex = STEPS.indexOf(step);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const canGoNext = useMemo(() => {
    if (step === "customer") {
      return !!(
        customerData.firstName?.trim() &&
        customerData.lastName?.trim() &&
        customerData.phone?.trim()
      );
    }
    if (step === "products") return orderItems.length > 0;
    if (step === "payment") {
      // Allow proceeding even if not fully paid (credit allowed), but must have at least one split.
      return payments.length > 0;
    }
    return true;
  }, [step, customerData, orderItems, payments]);

  const handleSubmit = () => {
    if (
      !customerData.firstName.trim() ||
      !customerData.lastName.trim() ||
      !customerData.phone.trim()
    ) {
      toast.error("اطلاعات مشتری ناقص است");
      setStep("customer");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("حداقل یک محصول باید انتخاب شود");
      setStep("products");
      return;
    }
    for (const item of orderItems) {
      if (!item.shelfId) {
        toast.error(`برای «${item.productName}» قفسه برداشت انتخاب نشده است`);
        setStep("products");
        return;
      }
      const locs = locationsByProduct[item.productId] ?? [];
      const loc = locs.find((l) => l.shelfId === item.shelfId);
      if (!loc || loc.available < item.quantity) {
        toast.error(
          `موجودی قفسه ${loc?.shelfCode ?? ""} برای «${item.productName}» کافی نیست`
        );
        setStep("products");
        return;
      }
    }
    // Validate payment splits
    for (const p of payments) {
      if (!p.amount || p.amount <= 0) {
        toast.error("مبلغ همه روش‌های پرداخت باید بزرگ‌تر از صفر باشد");
        setStep("payment");
        return;
      }
      if ((p.method === "card" || p.method === "online_gateway") && !p.gatewayTxnId?.trim()) {
        toast.error("کد پیگیری برای پرداخت کارتی / درگاه پرداخت الزامی است");
        setStep("payment");
        return;
      }
      if (p.method === "credit" && !p.dueDate) {
        toast.error("تاریخ سررسید برای بدهی الزامی است");
        setStep("payment");
        return;
      }
    }
    if (allocated > finalTotal) {
      toast.error("مجموع پرداخت‌ها بیشتر از مبلغ نهایی است");
      setStep("payment");
      return;
    }
    if (payments.length === 0) {
      toast.error("حداقل یک روش پرداخت اضافه کنید");
      setStep("payment");
      return;
    }

    const customer = `${customerData.firstName.trim()} ${customerData.lastName.trim()}`.trim();
    onSave({
      customerId: customerData.id,
      customer,
      customerPhone: customerData.phone.trim(),
      customerAddress: customerAddress.trim(),
      items: orderItems,
      total: subtotal,
      discount,
      discountAmount,
      finalTotal,
      payments,
      paymentStatus,
      notes: notes.trim(),
    });
    onOpenChange(false);
  };

  const goNext = () => {
    if (!canGoNext) {
      if (step === "customer") toast.error("اطلاعات مشتری را تکمیل کنید");
      else if (step === "products") toast.error("حداقل یک محصول انتخاب کنید");
      else if (step === "payment") toast.error("حداقل یک روش پرداخت اضافه کنید");
      return;
    }
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "ویرایش سفارش" : "ایجاد سفارش جدید"}
          </DialogTitle>
          <DialogDescription>
            مراحل ایجاد سفارش: مشتری، محصولات، پرداخت، تأیید نهایی
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const active = step === s;
            const done = STEPS.indexOf(step) > i;
            const icon =
              s === "customer" ? (
                <UserIcon className="h-3.5 w-3.5" />
              ) : s === "products" ? (
                <ShoppingBasket className="h-3.5 w-3.5" />
              ) : s === "payment" ? (
                <Wallet className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              );
            const label =
              s === "customer"
                ? "مشتری"
                : s === "products"
                ? "محصولات"
                : s === "payment"
                ? "پرداخت"
                : "تأیید";
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : done
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : icon}
                مرحله {i + 1}: {label}
              </button>
            );
          })}
        </div>

        {/* Scope selector (visible on product step) */}
        {step === "products" && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <Label className="mb-2 flex items-center gap-1.5 text-sm">
              <Warehouse className="h-4 w-4 text-primary" />
              شعبه / فضای ذخیره‌سازی برای برداشت کالا
            </Label>
            <Select
              value={scopeSpaceId.toString()}
              onValueChange={(v) => setScopeSpaceId(parseInt(v))}
            >
              <SelectTrigger className="w-full sm:w-[360px]">
                <SelectValue placeholder="انتخاب فضا" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">همه فضاها (موجودی کلی)</SelectItem>
                {spaces.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id.toString()}>
                    <div className="flex flex-col text-right">
                      <span className="font-medium">{sp.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {StorageSpaceTypeLabels[sp.type]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={step} onValueChange={(v) => setStep(v as Step)} dir="rtl">
          <TabsList className="hidden">
            {STEPS.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: customer */}
          <TabsContent value="customer" className="space-y-4 pt-2">
            <CustomerPicker value={customerData} onChange={setCustomerData} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>آدرس تحویل (اختیاری)</Label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="آدرس کامل تحویل سفارش..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>یادداشت سفارش (اختیاری)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="توضیحات اضافی..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Step 2: products */}
          <TabsContent value="products" className="pt-2">
            <ProductSelector
              products={products}
              categories={categories}
              brands={brands}
              selectedProducts={
                new Map(
                  Array.from(selectedItems.entries()).map(([k, v]) => [k, v.quantity])
                )
              }
              onProductSelect={handleProductSelect}
              availableMap={availableMap}
              scopeLabel={scopeLabel}
            />
            {orderItems.length > 0 && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-3 text-sm">
                <span className="font-medium">{orderItems.length}</span> محصول انتخاب شده • جمع کل{" "}
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
            )}
          </TabsContent>

          {/* Step 3: payment */}
          <TabsContent value="payment" className="pt-2">
            <PaymentPanel
              subtotal={subtotal}
              discount={discount}
              onDiscountChange={setDiscount}
              payments={payments}
              onPaymentsChange={setPayments}
              items={orderItems}
              customerId={customerData.id}
            />
          </TabsContent>

          {/* Step 4: summary */}
          <TabsContent value="summary" className="space-y-4 pt-2">
            <Card className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <UserIcon className="h-4 w-4 text-primary" />
                مشتری
              </p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">نام: </span>
                  <span className="font-medium">
                    {customerData.firstName} {customerData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">موبایل: </span>
                  <span className="font-medium" dir="ltr">
                    {customerData.phone}
                  </span>
                </div>
                {customerAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">آدرس: </span>
                    {customerAddress}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <ShoppingBasket className="h-4 w-4 text-primary" />
                اقلام سفارش
              </p>
              <OrderItemsTable
                items={orderItems}
                onRemoveItem={handleRemoveItem}
                locationsByProduct={locationsByProduct}
                onChangeShelf={handleChangeShelf}
              />
            </Card>

            <Card className="space-y-2 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Wallet className="h-4 w-4 text-primary" />
                خلاصه مالی
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">جمع اقلام</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>تخفیف</span>
                  <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 text-base font-bold">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="tabular-nums">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <div className="space-y-1 border-t pt-2">
                <p className="text-xs font-medium text-muted-foreground">روش‌های پرداخت</p>
                {payments.length === 0 ? (
                  <p className="text-xs text-destructive">روش پرداختی ثبت نشده</p>
                ) : (
                  payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{PaymentMethodLabels[p.method]}</Badge>
                        {p.gatewayTxnId && (
                          <span className="text-xs text-muted-foreground" dir="ltr">
                            #{p.gatewayTxnId}
                          </span>
                        )}
                        {p.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            سررسید: {p.dueDate}
                          </span>
                        )}
                      </div>
                      <span className="font-medium tabular-nums">
                        {formatPrice(p.amount)}
                      </span>
                    </div>
                  ))
                )}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">وضعیت پرداخت</span>
                  <Badge
                    className={
                      paymentStatus === "paid"
                        ? "bg-success text-success-foreground"
                        : paymentStatus === "partial"
                        ? "bg-warning text-warning-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {paymentStatus === "paid"
                      ? "پرداخت کامل"
                      : paymentStatus === "partial"
                      ? "پرداخت ناقص"
                      : "پرداخت نشده"}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-sm">
            <div className="font-semibold">
              مبلغ نهایی: {formatPrice(finalTotal)}
            </div>
            {discountAmount > 0 && (
              <div className="text-xs text-muted-foreground">
                از {formatPrice(subtotal)} با {formatPrice(discountAmount)} تخفیف
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          {!isFirst && (
            <Button variant="outline" onClick={goBack}>
              مرحله قبل
            </Button>
          )}
          {!isLast ? (
            <Button onClick={goNext}>مرحله بعد</Button>
          ) : (
            <Button onClick={handleSubmit}>
              {isEditing ? "ذخیره تغییرات" : "ثبت نهایی سفارش"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
