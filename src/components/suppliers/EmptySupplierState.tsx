
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptySupplierStateProps {
  onAddSupplier: () => void;
}

export function EmptySupplierState({ onAddSupplier }: EmptySupplierStateProps) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center bg-gray-900">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Truck className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium">هیچ تامین‌کننده‌ای یافت نشد</h3>
      <p className="text-sm text-gray-400 mt-1 mb-4">
        با ایجاد اولین تامین‌کننده خود شروع کنید
      </p>
      <Button 
        variant="outline" 
        onClick={onAddSupplier}
        className="mt-2"
      >
        افزودن تامین‌کننده
      </Button>
    </div>
  );
}
