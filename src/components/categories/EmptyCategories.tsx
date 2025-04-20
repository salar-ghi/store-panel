
import { PlusCircle, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCategoriesProps {
  onClick: () => void;
}

export function EmptyCategories({ onClick }: EmptyCategoriesProps) {
  return (
    <div className="text-center py-20 border rounded-lg bg-muted/10">
      <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="text-xl font-medium mt-4">دسته‌بندی‌ای یافت نشد</h3>
      <p className="text-muted-foreground mt-2">برای شروع، اولین دسته‌بندی خود را ایجاد کنید</p>
      <Button className="mt-4" onClick={onClick}>
        <PlusCircle className="ml-2 h-4 w-4" />
        افزودن دسته‌بندی
      </Button>
    </div>
  );
}
