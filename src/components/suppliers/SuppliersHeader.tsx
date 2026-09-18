
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SuppliersHeaderProps {
  openDialog: () => void;
}

export function SuppliersHeader({ openDialog }: SuppliersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">تامین‌کنندگان</h2>
      </div>
      
      <Button 
        onClick={openDialog} 
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4 ml-1" />
        افزودن تامین‌کننده
      </Button>
    </div>
  );
}
