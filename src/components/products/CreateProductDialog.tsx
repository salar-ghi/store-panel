
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
      toast.success("محصول با موفقیت ایجاد شد");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ایجاد محصول");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          افزودن محصول
        </Button>
      </DialogTrigger>
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
