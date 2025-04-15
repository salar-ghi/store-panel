
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface ViewProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({ product, open, onOpenChange }: ViewProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
            <p>{product.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Description
            </h4>
            <p>{product.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
              <p>${product.price.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Stock Quantity
              </h4>
              <p>{product.stockQuantity}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Category
              </h4>
              <p>{product.categoryName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
              <p>{product.brandName}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Supplier
            </h4>
            <p>{product.supplierName}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
