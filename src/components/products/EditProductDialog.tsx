
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { ProductForm } from "./ProductForm";
import { ProductService } from "@/services/product-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateProductRequest, Product, UpdateProductRequest } from "@/types/product";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      const updateData: UpdateProductRequest = {
        ...data,
        status: data.status,
        availability: data.availability,
      };
      await ProductService.update(product.id, updateData);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت بروزرسانی شد",
        variant: "default",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در بروزرسانی محصول",
        variant: "destructive",
      });
    }
  };

  // Convert Product to initialData format
  const initialData: Partial<CreateProductRequest> = {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    brandId: product.brandId,
    supplierId: product.supplierId,
    images: product.images || [],
    coverImage: product.coverImage,
    tags: product.tags || [],
    location: product.location,
    reorderLevel: product.reorderLevel,
    status: product.status,
    availability: product.availability,
    dimensions: product.dimensions,
    stock: product.stock,
    prices: product.prices || [],
    attributes: product.attributes || [],
    variants: product.variants || [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش محصول</DialogTitle>
          <DialogDescription>
            اطلاعات محصول را ویرایش کنید.
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          onSubmit={handleSubmit} 
          initialData={initialData}
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
}
