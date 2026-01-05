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
import { Plus, Minus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductSelectorProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedProducts: Map<number, number>; // productId -> quantity
  onProductSelect: (productId: number, quantity: number) => void;
}

export function ProductSelector({
  products,
  categories,
  brands,
  selectedProducts,
  onProductSelect,
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const filteredBrands = useMemo(() => {
    if (selectedCategory === "all") return brands;
    const categoryId = parseInt(selectedCategory);
    return brands.filter((b) => b.categoryIds?.includes(categoryId));
  }, [brands, selectedCategory]);

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
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const currentQty = selectedProducts.get(productId) || 0;
    const newQty = Math.max(0, currentQty + delta);
    onProductSelect(productId, newQty);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی محصول..."
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

      {/* Products Grid */}
      <ScrollArea className="h-[300px] rounded-md border p-2">
        <div className="grid gap-2">
          {filteredProducts.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              محصولی یافت نشد
            </div>
          ) : (
            filteredProducts.map((product) => {
              const quantity = selectedProducts.get(product.id) || 0;
              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    quantity > 0 ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{product.name}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.categoryName}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.brandName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)}
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
                    <span className="w-8 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(product.id, 1)}
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
