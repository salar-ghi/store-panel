
import { Button } from "@/components/ui/button";

interface SuppliersHeaderProps {
  openDialog: () => void;
}

export function SuppliersHeader({ openDialog }: SuppliersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">تامین‌کنندگان</h2>
        <p className="text-muted-foreground">مدیریت تامین‌کنندگان محصولات</p>
      </div>
      
      <Button 
        onClick={openDialog} 
        className="flex items-center gap-2"
      >
        افزودن تامین‌کننده
      </Button>
    </div>
  );
}
