
import { useState } from 'react';
import { Product } from '@/types/product';
import { getProductPrice, getProductStock } from '@/data/ordersData';

export function useProductFilter(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">("all");

  const maxPrice = Math.max(...products.map(p => getProductPrice(p)), 1000);
  
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
    .filter((product) => {
      const price = getProductPrice(product);
      return price >= priceRange[0] && price <= priceRange[1];
    })
    .filter((product) => {
      const stock = getProductStock(product);
      if (stockFilter === "inStock") return stock > 0;
      if (stockFilter === "lowStock") return stock > 0 && stock <= 5;
      if (stockFilter === "outOfStock") return stock === 0;
      return true; // "all" option
    });
  
  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "price") {
      const priceA = getProductPrice(a);
      const priceB = getProductPrice(b);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    } else if (sortField === "stockQuantity") {
      const stockA = getProductStock(a);
      const stockB = getProductStock(b);
      return sortOrder === "asc" ? stockA - stockB : stockB - stockA;
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
