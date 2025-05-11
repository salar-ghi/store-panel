
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BrandService } from "@/services/brand-service";
import { Brand } from "@/types/brand";
import { BrandsHeader } from "@/components/brands/BrandsHeader";
import { BrandsCard } from "@/components/brands/BrandsCard";
import { AddBrandDialog } from "@/components/brands/AddBrandDialog";

export default function Brands() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandService.getAll,
  });

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setIsOpen(true);
  }

  function openDialog() {
    setEditingBrand(null);
    setIsOpen(true);
  }

  function handleDialogClose() {
    setIsOpen(false);
    setEditingBrand(null);
  }

  return (
    <div className="space-y-6 py-6">
      <AddBrandDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        editingBrand={editingBrand}
        onSuccess={handleDialogClose}
      >
        <BrandsHeader openDialog={openDialog} />
      </AddBrandDialog>

      <BrandsCard 
        brands={brands}
        isLoading={isLoading}
        onEdit={handleEdit}
        onAddBrand={openDialog}
      />
    </div>
  );
}
