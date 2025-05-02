
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreateProductDialog } from "@/components/products/CreateProductDialog";
import { ProductList } from "@/components/products/ProductList";
import { ViewProductDialog } from "@/components/products/ViewProductDialog";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  function handleViewProduct(product: Product) {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  }

  return (
    <div className="space-y-6 py-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">محصولات</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          افزودن محصول
        </Button>
      </div>

      <ProductList 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onViewProduct={handleViewProduct}
      />

      {selectedProduct && (
        <ViewProductDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          product={selectedProduct}
        />
      )}

      <CreateProductDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
