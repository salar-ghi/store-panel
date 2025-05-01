
import { useState } from 'react';
import { Product } from '@/types/product';

export function useProductFilter(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">("all");

  const maxPrice = Math.max(...products.map(p => p.price), 1000);
  
  // Get unique categories and brands
  const categories = [...new Set(products.map(p => p.categoryName))];
  const brands = [...new Set(products.map(p => p.brandName))];
  
  // Apply filters and search
  const filteredProducts = products
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((product) => 
      categoryFilter ? product.categoryName === categoryFilter : true
    )
    .filter((product) => 
      brandFilter ? product.brandName === brandFilter : true
    )
    .filter((product) => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .filter((product) => {
      if (stockFilter === "inStock") return product.stockQuantity > 0;
      if (stockFilter === "lowStock") return product.stockQuantity > 0 && product.stockQuantity <= 5;
      if (stockFilter === "outOfStock") return product.stockQuantity === 0;
      return true; // "all" option
    });
  
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
    setSearchQuery("");
    setCategoryFilter("");
    setBrandFilter("");
    setPriceRange([0, maxPrice]);
    setSortField("name");
    setSortOrder("asc");
    setStockFilter("all");
  };

  const hasFilters = categoryFilter || brandFilter || sortField !== "name" || sortOrder !== "asc" || priceRange[0] > 0 || priceRange[1] < maxPrice || stockFilter !== "all";

  return {
    searchQuery,
    setSearchQuery,
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
    stockFilter,
    setStockFilter,
    maxPrice,
    categories,
    brands,
    filteredProducts: sortedProducts,
    resetFilters,
    hasFilters
  };
}
