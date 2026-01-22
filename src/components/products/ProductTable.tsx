
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductService } from "@/services/product-service";
import { Product } from "@/types/product";
import { getProductPrice, getProductStock } from "@/data/ordersData";

interface ProductTableProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
}

export function ProductTable({ products, onViewProduct }: ProductTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ProductService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("محصول با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "خطا در حذف محصول");
    },
  });

  if (products.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">محصولی یافت نشد</h3>
          <p className="text-sm text-muted-foreground">
            فیلترهای خود را تنظیم کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">نام محصول</TableHead>
            <TableHead className="text-right">قیمت</TableHead>
            <TableHead className="text-right">موجودی</TableHead>
            <TableHead className="text-right">دسته بندی</TableHead>
            <TableHead className="text-right">برند</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-right">{product.name}</TableCell>
              <TableCell className="text-right">{getProductPrice(product).toLocaleString()} تومان</TableCell>
              <TableCell className="text-right">{getProductStock(product)}</TableCell>
              <TableCell className="text-right">{product.categoryName}</TableCell>
              <TableCell className="text-right">{product.brandName}</TableCell>
              <TableCell>
                <div className="flex gap-2">
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
                    onClick={() => toast.info("قابلیت ویرایش هنوز پیاده‌سازی نشده است")}
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
  );
}
