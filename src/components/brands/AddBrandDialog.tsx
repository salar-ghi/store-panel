
import { Brand } from "@/types/brand";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BrandForm } from "@/components/brands/BrandForm";
import { ReactNode } from "react";

interface AddBrandDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingBrand: Brand | null;
  onSuccess: () => void;
  children: ReactNode;
}

export function AddBrandDialog({ 
  isOpen, 
  setIsOpen, 
  editingBrand, 
  onSuccess,
  children 
}: AddBrandDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <BrandForm 
          onSuccess={onSuccess} 
          editingBrand={editingBrand} 
        />
      </DialogContent>
    </Dialog>
  );
}
