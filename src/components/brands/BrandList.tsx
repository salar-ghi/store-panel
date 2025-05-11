
import { Pencil, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Brand } from "@/types/brand";
import { BrandService } from "@/services/brand-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader className="bg-gray-900">
          <TableRow>
            <TableHead className="w-16">لوگو</TableHead>
            <TableHead>نام</TableHead>
            <TableHead>توضیحات</TableHead>
            <TableHead>تاریخ ایجاد</TableHead>
            <TableHead className="text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell>
                <Avatar className="h-10 w-10">
                  {brand.logo ? (
                    <AvatarImage src={brand.logo} alt={brand.name} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {brand.name.substring(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.description}</TableCell>
              <TableCell>{new Date(brand.createdTime).toLocaleDateString('fa-IR')}</TableCell>
              <TableCell className="text-left">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(brand)}
                  className="hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(brand.id)}
                  className="hover:bg-destructive/10 text-destructive"
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
