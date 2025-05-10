
import { Button } from "@/components/ui/button";
import { PackageOpen } from "lucide-react";

interface EmptyProductListProps {
  searchQuery: string;
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function EmptyProductList({
  searchQuery,
  hasFilters,
  onResetFilters,
}: EmptyProductListProps) {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <PackageOpen className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">هیچ محصولی یافت نشد</h2>
      <p className="mb-8 mt-2 text-center text-sm text-muted-foreground max-w-sm">
        {searchQuery ? (
          <>جستجوی "<span className="font-medium">{searchQuery}</span>" نتیجه‌ای نداشت.</>
        ) : hasFilters ? (
          <>هیچ محصولی با فیلترهای انتخاب شده پیدا نشد. فیلترها را تغییر دهید.</>
        ) : (
          <>هنوز هیچ محصولی در سیستم ثبت نشده است. از دکمه "افزودن محصول" استفاده کنید.</>
        )}
      </p>
      {hasFilters && (
        <Button onClick={onResetFilters} variant="outline">
          پاک کردن فیلترها
        </Button>
      )}
    </div>
  );
}
