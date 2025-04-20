
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BannerForm } from "./BannerForm";

interface BannerHeaderProps {
  onBannerAdded: () => void;
}

export function BannerHeader({ onBannerAdded }: BannerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">مدیریت بنرها</h1>
        <p className="text-muted-foreground">ایجاد و مدیریت بنرهای تبلیغاتی در فروشگاه</p>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <PlusCircle className="ml-2 h-4 w-4" />
            افزودن بنر
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>ایجاد بنر جدید</SheetTitle>
          </SheetHeader>
          <BannerForm onBannerAdded={onBannerAdded} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
