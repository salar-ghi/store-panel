import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Search, PackageX, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatPrice, formatPersianNumber } from "@/lib/format";

interface ProductSelectorProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedProducts: Map<number, number>; // productId -> quantity
  onProductSelect: (productId: number, quantity: number) => void;
  /** Map of productId -> sellable quantity from the inventory engine, scoped to chosen branch/space. */
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const filteredBrands = useMemo(() => {
    if (selectedCategory === "all") return brands;
    const categoryId = parseInt(selectedCategory);
    return brands.filter((b) => b.categoryIds?.includes(categoryId));
  }, [brands, selectedCategory]);

  // Only sellable products: must be active/available AND have stock in scope
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId === parseInt(selectedCategory);
      const matchesBrand =
        selectedBrand === "all" || product.brandId === parseInt(selectedBrand);
      const isSellable =
        product.status === "active" &&
        (product.availability === "available" || product.availability === undefined);
      const hasStock = (availableMap[product.id] ?? 0) > 0;
      return matchesSearch && matchesCategory && matchesBrand && isSellable && hasStock;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, availableMap]);

  const formatPrice = (price: number) => price.toLocaleString("fa-IR") + " تومان";

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی محصول دارای موجودی..."
            className="pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setSelectedBrand("all");
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="برند" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه برندها</SelectItem>
            {filteredBrands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {scopeLabel && (
        <div className="text-xs text-muted-foreground">
          فقط محصولات دارای موجودی در «{scopeLabel}» نمایش داده می‌شوند.
        </div>
      )}

      {/* Products Grid */}
      <ScrollArea dir="rtl" className="h-[320px] rounded-md border p-2">
        <div className="grid gap-2">
          {filteredProducts.length === 0 ? (
            <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <PackageX className="h-8 w-8" />
              <p className="text-sm">محصول قابل فروشی با این فیلترها یافت نشد</p>
              <p className="text-xs">محصولات بدون موجودی نمایش داده نمی‌شوند</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const quantity = selectedProducts.get(product.id) || 0;
              const available = availableMap[product.id] ?? 0;
              const lowStock = available > 0 && available <= 5;
              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    quantity > 0 ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{product.name}</p>
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
                        موجودی: {available.toLocaleString("fa-IR")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(product.id, 1)}
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
  );
}
