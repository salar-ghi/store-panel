
import { Button } from "@/components/ui/button";

interface EmptyProductListProps {
  searchQuery: string;
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function EmptyProductList({ searchQuery, hasFilters, onResetFilters }: EmptyProductListProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
      <div className="text-center">
        <h3 className="text-lg font-medium">محصولی یافت نشد</h3>
        <p className="text-sm text-muted-foreground">
          {searchQuery || hasFilters ? 
            "فیلترهای خود را تنظیم کنید" : 
            "اولین محصول خود را اضافه کنید"}
        </p>
        {(searchQuery || hasFilters) && (
          <Button variant="outline" className="mt-4" onClick={onResetFilters}>
            حذف فیلترها
          </Button>
        )}
      </div>
    </div>
  );
}
