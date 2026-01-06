import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash, Power, PowerOff } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

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

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) => 
      SupplierService.toggleStatus(id, isApproved),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(variables.isApproved ? "تامین‌کننده فعال شد" : "تامین‌کننده غیرفعال شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تغییر وضعیت تامین‌کننده");
    },
  });

  function handleDelete(id: number) {
    if (confirm("آیا از حذف این تامین‌کننده اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  }
  
  function handleToggleStatus(supplier: Supplier) {
    const newStatus = !supplier.isApproved;
    toggleStatusMutation.mutate({ id: supplier.id, isApproved: newStatus });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
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
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">
                <Link to={`/suppliers/${supplier.id}`} className="hover:text-primary hover:underline">
                  {supplier.name}
                </Link>
              </TableCell>
              <TableCell>{supplier.contactInfo}</TableCell>
              <TableCell>{supplier.email || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch dir="ltr"
                    checked={supplier.isApproved !== false}
                    onCheckedChange={() => handleToggleStatus(supplier)}
                    disabled={toggleStatusMutation.isPending}
                  />
                  {supplier.isApproved !== false ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      فعال
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      غیرفعال
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-left">
                <div className="inline-flex items-center justify-center gap-">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(supplier)}
                    className="hover:bg-primary/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
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
