
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
  const { isLoading, data: products = [] } = useQuery({
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
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

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
        <p>Loading products...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8"
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
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || categoryFilter || brandFilter ? 
                "Try adjusting your filters" : 
                "Get started by adding your first product"}
            </p>
            {(searchQuery || categoryFilter || brandFilter || sortField !== "name" || sortOrder !== "asc") && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Reset Filters
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
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8"
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
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>{product.brandName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                      onClick={() => toast.info("Edit functionality not implemented")}
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
          {hasActiveFilters ? "Filters Applied" : "Filter & Sort"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Sort By</h3>
            <div className="grid grid-cols-2 gap-2">
              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stockQuantity">Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Filter by Category</h3>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Filter by Brand</h3>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Brands</SelectItem>
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
              <h3 className="font-medium">Price Range</h3>
              <span className="text-sm text-muted-foreground">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[0, maxPrice]}
              max={maxPrice}
              step={1}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="py-4"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset All
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
