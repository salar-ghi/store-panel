
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash, Check } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { SupplierService } from "@/services/supplier-service";
import { Supplier } from "@/types/supplier";

interface SuppliersTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
}

export function SuppliersTable({ suppliers, onEdit }: SuppliersTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: SupplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف تامین‌کننده");
    },
  });

  const approveMutation = useMutation({
    mutationFn: SupplierService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت تایید شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تایید تامین‌کننده");
    },
  });

  function handleDelete(id: number) {
    if (confirm("آیا از حذف این تامین‌کننده اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  }
  
  function handleApprove(id: number) {
    approveMutation.mutate(id);
  }

  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader className="bg-gray-900">
          <TableRow>
            <TableHead>نام</TableHead>
            <TableHead>اطلاعات تماس</TableHead>
            <TableHead>ایمیل</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead className="text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell className="font-medium">
                <Link to={`/suppliers/${supplier.id}`} className="hover:text-blue-400 hover:underline">
                  {supplier.name}
                </Link>
              </TableCell>
              <TableCell>{supplier.contactInfo}</TableCell>
              <TableCell>{supplier.email || '-'}</TableCell>
              <TableCell>
                {supplier.status ? (
                  <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-500/50">
                    تایید شده
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-500/50">
                    در انتظار تایید
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-left">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(supplier)}
                    className="hover:bg-primary/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {!supplier.status && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApprove(supplier.id)}
                      className="hover:bg-green-500/10 text-green-500"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(supplier.id)}
                    className="hover:bg-destructive/10 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
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
