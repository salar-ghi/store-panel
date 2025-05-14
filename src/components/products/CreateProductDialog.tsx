
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
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>ایجاد محصول جدید</DialogTitle>
          <DialogDescription>
            برای ایجاد محصول جدید، اطلاعات زیر را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
