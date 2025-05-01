
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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

export function FilterSort({
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
