import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, PackageX, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatPrice, formatPersianNumber } from "@/lib/format";
import { CategoryTreePicker } from "./CategoryTreePicker";
import { BrandChips } from "./BrandChips";

interface ProductSelectorProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedProducts: Map<number, number>;
  onProductSelect: (productId: number, quantity: number) => void;
  availableMap: Record<number, number>;
  scopeLabel?: string;
}

export function ProductSelector({
  products,
  categories,
  brands,
  selectedProducts,
  onProductSelect,
  availableMap,
  scopeLabel,
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandIds, setBrandIds] = useState<number[]>([]);

  // Pre-compute count of sellable products per category.
  const categoryCounts = useMemo(() => {
    const map: Record<number, number> = {};
    for (const p of products) {
      const sellable =
        p.status === "active" &&
        (p.availability === "available" || p.availability === undefined) &&
        (availableMap[p.id] ?? 0) > 0;
      if (!sellable) continue;
      map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    }
    return map;
  }, [products, availableMap]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = categoryId == null || product.categoryId === categoryId;
      const matchesBrand =
        brandIds.length === 0 || brandIds.includes(product.brandId);
      const isSellable =
        product.status === "active" &&
        (product.availability === "available" || product.availability === undefined);
      const hasStock = (availableMap[product.id] ?? 0) > 0;
      return matchesSearch && matchesCategory && matchesBrand && isSellable && hasStock;
    });
  }, [products, searchTerm, categoryId, brandIds, availableMap]);

  const handleQuantityChange = (productId: number, delta: number, isWeight: boolean) => {
    const currentQty = selectedProducts.get(productId) || 0;
    const max = availableMap[productId] ?? 0;
    const step = isWeight ? 0.5 : 1;
    let newQty = Math.max(0, +(currentQty + delta * step).toFixed(3));
    if (newQty > max) {
      newQty = max;
      toast.warning(`موجودی قابل فروش این محصول ${formatPersianNumber(max)} ${isWeight ? 'واحد وزن' : 'عدد'} است`);
    }
    onProductSelect(productId, newQty);
  };

  const handleQuantityInput = (productId: number, value: string, isWeight: boolean) => {
    const max = availableMap[productId] ?? 0;
    let n = Number(value);
    if (!isFinite(n) || n < 0) n = 0;
    if (!isWeight) n = Math.floor(n);
    if (n > max) {
      n = max;
      toast.warning(`موجودی قابل فروش این محصول ${formatPersianNumber(max)} ${isWeight ? 'واحد وزن' : 'عدد'} است`);
    }
    onProductSelect(productId, n);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
      {/* Left rail: category tree */}
      <div className="lg:max-h-[520px]">
        <CategoryTreePicker
          categories={categories}
          value={categoryId}
          onChange={(id) => {
            setCategoryId(id);
            setBrandIds([]);
          }}
          counts={categoryCounts}
        />
      </div>

      {/* Right: brand chips + search + product list */}
      <div className="space-y-3">
        <BrandChips
          brands={brands}
          filterCategoryId={categoryId}
          value={brandIds}
          onChange={setBrandIds}
        />

        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی محصول دارای موجودی..."
            className="pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {scopeLabel && (
          <div className="text-xs text-muted-foreground">
            فقط محصولات دارای موجودی در «{scopeLabel}» نمایش داده می‌شوند.
          </div>
        )}

        <ScrollArea dir="rtl" className="h-[360px] rounded-md border p-2">
          <div className="grid gap-2">
            {filteredProducts.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <PackageX className="h-8 w-8" />
                <p className="text-sm">محصول قابل فروشی با این فیلترها یافت نشد</p>
                <p className="text-xs">محصولات بدون موجودی نمایش داده نمی‌شوند</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const quantity = selectedProducts.get(product.id) || 0;
                const available = availableMap[product.id] ?? 0;
                const lowStock = available > 0 && available <= 5;
                const isWeight =
                  product.salesUnit?.mode === 'weight' || product.salesUnit?.mode === 'both';
                const wUnit =
                  product.salesUnit?.weightUnit === 'gram' ? 'گرم' : 'کیلوگرم';
                const unitLabel = isWeight ? wUnit : 'عدد';
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      quantity > 0 ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium flex items-center gap-1.5">
                        {product.name}
                        {isWeight && (
                          <Badge variant="outline" className="gap-1 text-[10px] border-primary/40 text-primary">
                            <Scale className="h-3 w-3" />
                            فروش وزنی
                          </Badge>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.categoryName}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.brandName}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            lowStock
                              ? "border-warning/40 bg-warning/10 text-warning"
                              : "border-success/40 bg-success/10 text-success"
                          }`}
                        >
                          موجودی: {formatPersianNumber(available)} {unitLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(
                          isWeight && product.salesUnit?.pricePerWeightUnit
                            ? product.salesUnit.pricePerWeightUnit
                            : (product.price ?? 0),
                        )}
                        {isWeight && <span className="text-xs"> / {unitLabel}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(product.id, -1, isWeight)}
                        disabled={quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      {isWeight ? (
                        <Input
                          type="number"
                          min={0}
                          max={available}
                          step={0.1}
                          value={quantity || ''}
                          onChange={(e) => handleQuantityInput(product.id, e.target.value, true)}
                          className="h-8 w-20 text-center font-medium"
                        />
                      ) : (
                        <span className="w-10 text-center font-medium tabular-nums">
                          {formatPersianNumber(quantity)}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(product.id, 1, isWeight)}
                        disabled={quantity >= available}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
