
import { Pencil, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Brand } from "@/types/brand";
import { BrandService } from "@/services/brand-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base64ToImageUrl } from "@/lib/image-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BrandListProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
}

export function BrandList({ brands, onEdit }: BrandListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: BrandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف برند");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این برند اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-foreground">لوگو</TableHead>
            <TableHead className="text-foreground">نام</TableHead>
            <TableHead className="text-foreground">توضیحات</TableHead>
            <TableHead className="text-foreground">دسته‌بندی‌ها</TableHead>
            <TableHead className="text-foreground">تاریخ ایجاد</TableHead>
            <TableHead className="text-left text-foreground">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id} className="border-border hover:bg-muted/30">
              <TableCell>
                <Avatar className="h-10 w-10">
                  {brand.logo ? (
                    <AvatarImage src={base64ToImageUrl(brand.logo)} alt={brand.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {brand.name.substring(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-medium text-foreground">{brand.name}</TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">{brand.description}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {brand.categories && brand.categories.length > 0 ? (
                    brand.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat.id} variant="secondary" className="text-xs">
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                  {brand.categories && brand.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{brand.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{new Date(brand.createdTime).toLocaleDateString('fa-IR')}</TableCell>
              <TableCell className="text-left">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(brand)}
                  className="hover:bg-primary/10 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(brand.id)}
                  className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
