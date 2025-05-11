
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandsHeaderProps {
  openDialog: () => void;
}

export function BrandsHeader({ openDialog }: BrandsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">برندها</h2>
        <p className="text-muted-foreground">مدیریت برندهای محصولات</p>
      </div>
      <Button 
        onClick={openDialog} 
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4 ml-1" />
        افزودن برند
      </Button>
    </div>
  );
}
