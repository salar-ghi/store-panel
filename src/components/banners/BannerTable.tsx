
import { Button } from "@/components/ui/button";
import { Banner, BannerSizeLabels, BannerTypeLabels } from "@/types/banner";
import { base64ToImageUrl } from "@/lib/image-upload";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Edit, Eye, EyeOff, ExternalLink, Loader2, PlusCircle, Trash2, MoreHorizontal, MousePointerClick, BarChart3 } from "lucide-react";
import { useState } from "react";
import { BannerForm } from "./BannerForm";
import { BannerService } from "@/services/banner-service";
import { toast } from "sonner";

interface BannerTableProps {
  banners: Banner[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function BannerTable({ banners, isLoading, onRefresh }: BannerTableProps) {
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await BannerService.deleteBanner(id);
      toast.success("بنر حذف شد");
      onRefresh();
    } catch {
      toast.error("خطا در حذف بنر");
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await BannerService.toggleBannerStatus(id, !current);
      toast.success(`بنر ${!current ? "فعال" : "غیرفعال"} شد`);
      onRefresh();
    } catch {
      toast.error("خطا در تغییر وضعیت بنر");
    }
  };

  const typeBadgeColors: Record<number, string> = {
    0: "bg-pink-500/10 text-pink-600 border-pink-200",
    1: "bg-blue-500/10 text-blue-600 border-blue-200",
    2: "bg-amber-500/10 text-amber-600 border-amber-200",
    3: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    4: "bg-violet-500/10 text-violet-600 border-violet-200",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!banners?.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <PlusCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">بنری وجود ندارد</p>
        <p className="text-sm text-muted-foreground mt-1">اولین بنر را ایجاد کنید</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-foreground">بنر</TableHead>
              <TableHead className="text-foreground">جایگاه‌ها</TableHead>
              <TableHead className="text-foreground">نوع</TableHead>
              <TableHead className="text-foreground">اندازه</TableHead>
              <TableHead className="text-foreground text-center">آمار</TableHead>
              <TableHead className="text-foreground text-center">وضعیت</TableHead>
              <TableHead className="text-left text-foreground">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <img
                        src={base64ToImageUrl(banner.imageUrl)}
                        alt={banner.altText || banner.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{banner.name}</div>
                      {banner.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{banner.description}</div>
                      )}
                      {banner.callToActionText && (
                        <Badge variant="outline" className="text-[10px] mt-0.5">{banner.callToActionText}</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {banner.placements?.length ? (
                      banner.placements.map((p) => (
                        <Badge key={p.id} variant="secondary" className="text-[10px]">{p.name}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeBadgeColors[banner.type] || ""}>
                    {BannerTypeLabels[banner.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{BannerSizeLabels[banner.size]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title="بازدید">
                      <BarChart3 className="h-3 w-3" /> {banner.viewCount}
                    </span>
                    <span className="flex items-center gap-1" title="کلیک">
                      <MousePointerClick className="h-3 w-3" /> {banner.clickCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {banner.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200" variant="outline">فعال</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">غیرفعال</Badge>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggle(banner.id, banner.isActive)}>
                        {banner.isActive ? <><EyeOff className="ml-2 h-4 w-4" />غیرفعال‌سازی</> : <><Eye className="ml-2 h-4 w-4" />فعال‌سازی</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditBanner(banner)}>
                        <Edit className="ml-2 h-4 w-4" />ویرایش
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(banner.id)}>
                        <Trash2 className="ml-2 h-4 w-4" />حذف
                      </DropdownMenuItem>
                      {banner.link && (
                        <DropdownMenuItem onClick={() => window.open(banner.link!, "_blank")}>
                          <ExternalLink className="ml-2 h-4 w-4" />مشاهده لینک
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!editBanner} onOpenChange={(open) => !open && setEditBanner(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="mb-4 pb-2 text-center">ویرایش بنر</SheetTitle>
          </SheetHeader>
          {editBanner && (
            <BannerForm
              initialData={editBanner}
              onSuccess={() => {
                setEditBanner(null);
                onRefresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
