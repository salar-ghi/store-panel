import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Warehouse } from "lucide-react";
import { toast } from "sonner";
import { StorageService } from "@/services/storage-service";
import { InventoryEngine, StockLocation } from "@/services/inventory-engine";
import { StorageSpaceTypeLabels } from "@/types/storage";
import { formatPrice } from "@/lib/format";

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

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  products,
  categories,
  brands,
  onSave,
}: OrderFormDialogProps) {
  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  // 0 = "همه فضاها"
  const [scopeSpaceId, setScopeSpaceId] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(
    new Map()
  );
  // productId -> all sellable shelf locations (within current scope)
  const [locationsByProduct, setLocationsByProduct] = useState<
    Record<number, StockLocation[]>
  >({});
  const [availableMap, setAvailableMap] = useState<Record<number, number>>({});

  const isEditing = !!order;

  const { data: spaces = [] } = useQuery({
    queryKey: ["storage", "spaces"],
    queryFn: () => StorageService.getSpaces(),
  });

  const scope = useMemo(
    () => (scopeSpaceId > 0 ? { spaceId: scopeSpaceId } : undefined),
    [scopeSpaceId]
  );

  // Recompute sellable map whenever scope or product list changes
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    InventoryEngine.getAvailableMap(
      products.map((p) => p.id),
      scope
    ).then((map) => {
      if (!cancelled) setAvailableMap(map);
    });
    return () => {
      cancelled = true;
    };
  }, [open, products, scope]);

  // When user selects a product, fetch its sellable locations
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

      // auto-assign shelf if missing or invalid in new scope
      setSelectedItems((prev) => {
        const updated = new Map(prev);
        let changed = false;
        for (const [pid, item] of updated) {
          const locs = next[pid] ?? [];
          const stillValid = item.shelfId
            ? locs.some((l) => l.shelfId === item.shelfId)
            : false;
          if (!stillValid) {
            const best = locs.find((l) => l.available >= item.quantity) ?? locs[0];
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
      setCustomer(order.customer);
      setCustomerPhone(order.customerPhone || "");
      setCustomerAddress(order.customerAddress || "");
      setNotes(order.notes || "");
      const map = new Map<number, SelectedItem>();
      order.items.forEach((item) => {
        map.set(item.productId, { quantity: item.quantity, shelfId: item.shelfId });
      });
      setSelectedItems(map);
      // try to infer scope from first item
      const firstSpace = order.items.find((i) => i.spaceId)?.spaceId;
      setScopeSpaceId(firstSpace ?? 0);
    } else {
      setCustomer("");
      setCustomerPhone("");
      setCustomerAddress("");
      setNotes("");
      setSelectedItems(new Map());
      setScopeSpaceId(0);
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
        product.salesUnit?.mode === 'weight' || product.salesUnit?.mode === 'both';
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
        saleUnit: isWeight ? 'weight' : 'piece',
        weightUnit: isWeight ? (product.salesUnit?.weightUnit as 'gram' | 'kilogram') : undefined,
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

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleRemoveItem = (productId: number) => {
    handleProductSelect(productId, 0);
  };

  const scopeLabel =
    scopeSpaceId > 0
      ? spaces.find((s) => s.id === scopeSpaceId)?.name
      : "همه فضاها";

  const handleSubmit = () => {
    if (!customer.trim()) {
      toast.error("نام مشتری الزامی است");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("حداقل یک محصول باید انتخاب شود");
      return;
    }

    // Validate every item has a shelf and enough stock there
    for (const item of orderItems) {
      if (!item.shelfId) {
        toast.error(`برای «${item.productName}» قفسه برداشت انتخاب نشده است`);
        return;
      }
      const locs = locationsByProduct[item.productId] ?? [];
      const loc = locs.find((l) => l.shelfId === item.shelfId);
      if (!loc || loc.available < item.quantity) {
        toast.error(
          `موجودی قفسه ${loc?.shelfCode ?? ""} برای «${item.productName}» کافی نیست`
        );
        return;
      }
    }

    onSave({
      customer: customer.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: orderItems,
      total: totalAmount,
      notes: notes.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "ویرایش سفارش" : "ایجاد سفارش جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "اطلاعات سفارش را ویرایش کنید"
              : "اطلاعات مشتری و محصولات سفارش را وارد کنید"}
          </DialogDescription>
        </DialogHeader>

        {/* Scope selector — acts as branch / warehouse filter */}
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
          <p className="mt-2 text-xs text-muted-foreground">
            با تغییر فضا، فقط محصولاتی که در آن فضا موجودی قابل فروش دارند نمایش داده می‌شوند.
          </p>
        </div>

        <Tabs defaultValue="customer" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">اطلاعات مشتری</TabsTrigger>
            <TabsTrigger value="products">انتخاب محصولات</TabsTrigger>
            <TabsTrigger value="summary">
              خلاصه سفارش ({orderItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">نام مشتری *</Label>
                <Input
                  id="customer"
                  placeholder="نام و نام خانوادگی"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس</Label>
                <Input
                  id="phone"
                  placeholder="09123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">آدرس</Label>
              <Textarea
                id="address"
                placeholder="آدرس کامل"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">توضیحات</Label>
              <Textarea
                id="notes"
                placeholder="توضیحات اضافی سفارش..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="products" className="pt-4">
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
          </TabsContent>

          <TabsContent value="summary" className="pt-4">
            <OrderItemsTable
              items={orderItems}
              onRemoveItem={handleRemoveItem}
              locationsByProduct={locationsByProduct}
              onChangeShelf={handleChangeShelf}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-lg font-bold">
            جمع کل: {totalAmount.toLocaleString("fa-IR")} تومان
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "ذخیره تغییرات" : "ثبت سفارش"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
