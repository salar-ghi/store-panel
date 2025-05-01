
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductService } from "@/services/product-service";
import { Product } from "@/types/product";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewProduct: (product: Product) => void;
}

export function ProductList({ 
  searchQuery, 
  onSearchChange,
  onViewProduct 
}: ProductListProps) {
  const queryClient = useQueryClient();
  const { isLoading, data: products = [], error } = useQuery({
    queryKey: ["products"],
    queryFn: ProductService.getAll,
  });

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Sort state
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const deleteMutation = useMutation({
    mutationFn: ProductService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("محصول با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "خطا در حذف محصول");
    },
  });

  // If there's an error fetching products
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-center">
        <div>
          <p className="text-lg font-medium text-red-600">خطا در بارگیری محصولات</p>
          <p className="mt-2 text-muted-foreground">لطفا اتصال به سرور را بررسی کنید</p>
          <Button 
            className="mt-4" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(products.map(p => p.categoryName))];
  const brands = [...new Set(products.map(p => p.brandName))];
  const maxPrice = Math.max(...products.map(p => p.price), 1000);
  
  // Apply filters and search
  const filteredProducts = products
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((product) => 
      categoryFilter ? product.categoryName === categoryFilter : true
    )
    .filter((product) => 
      brandFilter ? product.brandName === brandFilter : true
    )
    .filter((product) => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
  
  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortField === "stockQuantity") {
      return sortOrder === "asc" ? a.stockQuantity - b.stockQuantity : b.stockQuantity - a.stockQuantity;
    } else {
      // Default to name sorting
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
  });

  const resetFilters = () => {
    setCategoryFilter("");
    setBrandFilter("");
    setPriceRange([0, maxPrice]);
    setSortField("name");
    setSortOrder("asc");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>در حال بارگیری محصولات...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجوی محصولات..."
              className="w-full pr-8 text-right"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <FilterSort
            categories={categories}
            brands={brands}
            maxPrice={maxPrice}
            categoryFilter={categoryFilter}
            brandFilter={brandFilter}
            priceRange={priceRange}
            sortField={sortField}
            sortOrder={sortOrder}
            setCategoryFilter={setCategoryFilter}
            setBrandFilter={setBrandFilter}
            setPriceRange={setPriceRange}
            setSortField={setSortField}
            setSortOrder={setSortOrder}
            resetFilters={resetFilters}
          />
        </div>
        <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">محصولی یافت نشد</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || categoryFilter || brandFilter ? 
                "فیلترهای خود را تنظیم کنید" : 
                "اولین محصول خود را اضافه کنید"}
            </p>
            {(searchQuery || categoryFilter || brandFilter || sortField !== "name" || sortOrder !== "asc") && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                حذف فیلترها
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی محصولات..."
            className="w-full pr-8 text-right"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <FilterSort
          categories={categories}
          brands={brands}
          maxPrice={maxPrice}
          categoryFilter={categoryFilter}
          brandFilter={brandFilter}
          priceRange={priceRange}
          sortField={sortField}
          sortOrder={sortOrder}
          setCategoryFilter={setCategoryFilter}
          setBrandFilter={setBrandFilter}
          setPriceRange={setPriceRange}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          resetFilters={resetFilters}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام محصول</TableHead>
              <TableHead className="text-right">قیمت</TableHead>
              <TableHead className="text-right">موجودی</TableHead>
              <TableHead className="text-right">دسته بندی</TableHead>
              <TableHead className="text-right">برند</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-right">{product.name}</TableCell>
                <TableCell className="text-right">{product.price.toLocaleString()} تومان</TableCell>
                <TableCell className="text-right">{product.stockQuantity}</TableCell>
                <TableCell className="text-right">{product.categoryName}</TableCell>
                <TableCell className="text-right">{product.brandName}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onViewProduct(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toast.info("قابلیت ویرایش هنوز پیاده‌سازی نشده است")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface FilterSortProps {
  categories: string[];
  brands: string[];
  maxPrice: number;
  categoryFilter: string;
  brandFilter: string;
  priceRange: [number, number];
  sortField: string;
  sortOrder: "asc" | "desc";
  setCategoryFilter: (category: string) => void;
  setBrandFilter: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortField: (field: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  resetFilters: () => void;
}

function FilterSort({
  categories,
  brands,
  maxPrice,
  categoryFilter,
  brandFilter,
  priceRange,
  sortField,
  sortOrder,
  setCategoryFilter,
  setBrandFilter,
  setPriceRange,
  setSortField,
  setSortOrder,
  resetFilters,
}: FilterSortProps) {
  const [open, setOpen] = useState(false);
  const hasActiveFilters = categoryFilter || brandFilter || sortField !== "name" || sortOrder !== "asc" || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters ? "فیلتر اعمال شده" : "فیلتر و مرتب‌سازی"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">مرتب سازی بر اساس</h3>
            <RadioGroup 
              value={`${sortField}-${sortOrder}`} 
              onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortField(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="name-asc" id="name-asc" />
                <Label htmlFor="name-asc">نام (صعودی)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="name-desc" id="name-desc" />
                <Label htmlFor="name-desc">نام (نزولی)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="price-asc" id="price-asc" />
                <Label htmlFor="price-asc">قیمت (کم به زیاد)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="price-desc" id="price-desc" />
                <Label htmlFor="price-desc">قیمت (زیاد به کم)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="stockQuantity-asc" id="stock-asc" />
                <Label htmlFor="stock-asc">موجودی (کم به زیاد)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="stockQuantity-desc" id="stock-desc" />
                <Label htmlFor="stock-desc">موجودی (زیاد به کم)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">فیلتر بر اساس دسته‌بندی</h3>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="همه دسته‌بندی‌ها" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="">همه دسته‌بندی‌ها</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">فیلتر بر اساس برند</h3>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="همه برندها" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="">همه برندها</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="font-medium">محدوده قیمت</h3>
              <span className="text-sm text-muted-foreground">
                {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} تومان
              </span>
            </div>
            <Slider
              defaultValue={[0, maxPrice]}
              max={maxPrice}
              step={1000}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="py-4"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              حذف فیلترها
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              اعمال
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
