
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/product-service";
import { Product } from "@/types/product";
import { SearchBar } from "./SearchBar";
import { FilterSort } from "./FilterSort";
import { ProductTable } from "./ProductTable";
import { EmptyProductList } from "./EmptyProductList";
import { useProductFilter } from "@/hooks/useProductFilter";

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
  const { isLoading, data: products = [], error } = useQuery({
    queryKey: ["products"],
    queryFn: ProductService.getAll,
  });
  
  const {
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    priceRange,
    setPriceRange,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    maxPrice,
    categories,
    brands,
    filteredProducts,
    resetFilters,
    hasFilters
  } = useProductFilter(products);

  // If there's an error fetching products
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-center">
        <div>
          <p className="text-lg font-medium text-red-600">خطا در بارگیری محصولات</p>
          <p className="mt-2 text-muted-foreground">لطفا اتصال به سرور را بررسی کنید</p>
          <Button 
            className="mt-4" 
            onClick={() => {}}
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>در حال بارگیری محصولات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <SearchBar 
          value={searchQuery} 
          onChange={onSearchChange} 
        />
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

      {filteredProducts.length === 0 ? (
        <EmptyProductList 
          searchQuery={searchQuery}
          hasFilters={hasFilters}
          onResetFilters={resetFilters}
        />
      ) : (
        <ProductTable 
          products={filteredProducts}
          onViewProduct={onViewProduct}
        />
      )}
    </div>
  );
}
