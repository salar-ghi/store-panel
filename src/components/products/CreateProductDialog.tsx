
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";
import { ProductService } from "@/services/product-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProductRequest } from "@/types/product";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      await ProductService.create(data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت ایجاد شد",
        variant: "default",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در ایجاد محصول",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-[900px] max-h-[92vh] overflow-hidden p-0 gap-0 bg-background"
      >
        <DialogHeader className="px-6 py-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <div className="text-right">
              <DialogTitle className="text-base font-semibold">ایجاد محصول جدید</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                مراحل را به ترتیب تکمیل کنید تا محصول در فروشگاه ثبت شود.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(92vh-72px)] px-6 py-5">
          <ProductForm onSubmit={handleSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
