
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuppliersHeader } from "@/components/suppliers/SuppliersHeader";
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";
import { EmptySupplierState } from "@/components/suppliers/EmptySupplierState";

import { SupplierService } from "@/services/supplier-service";
import { Supplier } from "@/types/supplier";

export default function Suppliers() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAll,
  });

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setIsOpen(true);
  }

  function openDialog() {
    setEditingSupplier(null);
    setIsOpen(true);
  }

  return (
    <div className="space-y-6 py-6">
      <SuppliersHeader openDialog={openDialog} />
      
      <AddSupplierDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        editingSupplier={editingSupplier}
        setEditingSupplier={setEditingSupplier}
      />

      <Card className="border shadow-sm bg-black text-white">
        <CardHeader className="pb-3">
          <CardTitle>مدیریت تامین‌کنندگان</CardTitle>
          <CardDescription className="text-gray-400">
            مشاهده و مدیریت تمامی تامین‌کنندگان محصولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-300">در حال بارگذاری تامین‌کنندگان...</div>
          ) : suppliers.length === 0 ? (
            <EmptySupplierState onAddSupplier={openDialog} />
          ) : (
            <SuppliersTable suppliers={suppliers} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
