
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">سفارش‌ها</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی سفارش‌ها..."
            className="w-full pr-8"
          />
        </div>
      </div>
      
      <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">سفارشی یافت نشد</h3>
          <p className="text-sm text-muted-foreground">
            پس از ثبت سفارش توسط مشتریان، سفارش‌ها در اینجا نمایش داده می‌شوند
          </p>
        </div>
      </div>
    </div>
  );
}
