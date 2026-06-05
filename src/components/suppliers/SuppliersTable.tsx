import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash, AlertTriangle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const deleteMutation = useMutation({
    mutationFn: SupplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت حذف شد");
      setSupplierToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف تامین‌کننده");
      setSupplierToDelete(null);
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
  
  function handleToggleStatus(supplier: Supplier) {
    const newStatus = !supplier.isApproved;
    toggleStatusMutation.mutate({ id: supplier.id, isApproved: newStatus });
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-foreground">نام</TableHead>
            <TableHead className="text-foreground">اطلاعات تماس</TableHead>
            <TableHead className="text-foreground">ایمیل</TableHead>
            <TableHead className="text-foreground">وضعیت</TableHead>
            <TableHead className="text-left text-foreground">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id} className="border-border hover:bg-muted/30">
              <TableCell className="font-medium">
                <Link to={`/suppliers/${supplier.id}`} className="hover:text-primary hover:underline text-foreground">
                  {supplier.name}
                </Link>
              </TableCell>
              <TableCell className="text-foreground">{supplier.contactInfo}</TableCell>
              <TableCell className="text-muted-foreground">{supplier.email || '-'}</TableCell>
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
                <div className="inline-flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(supplier)}
                    className="hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSupplierToDelete(supplier)}
                    className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-right">
                <AlertDialogTitle>حذف تامین‌کننده</AlertDialogTitle>
                <AlertDialogDescription>
                  این عملیات قابل بازگشت نیست.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
            آیا از حذف تامین‌کننده{" "}
            <span className="font-semibold">«{supplierToDelete?.name}»</span>{" "}
            اطمینان دارید؟
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (supplierToDelete) deleteMutation.mutate(supplierToDelete.id);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "در حال حذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
