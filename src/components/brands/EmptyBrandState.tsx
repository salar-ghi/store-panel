
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyBrandStateProps {
  onAddBrand: () => void;
}

export function EmptyBrandState({ onAddBrand }: EmptyBrandStateProps) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-muted/30">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Package className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-foreground">هیچ برندی یافت نشد</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        با ایجاد اولین برند خود شروع کنید
      </p>
      <Button 
        variant="outline" 
        onClick={onAddBrand}
        className="mt-2"
      >
        <Plus className="ml-2 h-4 w-4" />
        افزودن برند
      </Button>
    </div>
  );
}
