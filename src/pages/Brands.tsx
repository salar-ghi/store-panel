
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BrandService } from "@/services/brand-service";
import { Brand } from "@/types/brand";
import { BrandForm } from "@/components/brands/BrandForm";
import { EmptyBrandState } from "@/components/brands/EmptyBrandState";
import { BrandList } from "@/components/brands/BrandList";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">برندها</h2>
          <p className="text-muted-foreground">مدیریت برندهای محصولات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openDialog} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4 ml-1" />
              افزودن برند
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <BrandForm 
              onSuccess={handleDialogClose} 
              editingBrand={editingBrand} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm bg-black text-white">
        <CardHeader className="pb-3">
          <CardTitle>مدیریت برندها</CardTitle>
          <CardDescription className="text-gray-400">
            مشاهده و مدیریت تمامی برندهای محصولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-300">در حال بارگذاری برندها...</div>
          ) : brands.length === 0 ? (
            <EmptyBrandState onAddBrand={openDialog} />
          ) : (
            <BrandList brands={brands} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
