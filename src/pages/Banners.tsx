
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Eye, EyeOff, ExternalLink, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BannerForm } from "@/components/banners/BannerForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Banners() {
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  const { data: banners, isLoading, error, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: BannerService.getAllBanners,
  });

  const handleBannerAdded = () => {
    refetch();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await BannerService.toggleBannerStatus(id, !currentStatus);
      toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      toast.error("Failed to update banner status");
    }
  };

  const getBannerSizeBadge = (size: string) => {
    switch (size) {
      case "small":
        return <Badge variant="outline">کوچک</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">متوسط</Badge>;
      case "large":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">بزرگ</Badge>;
      case "full-width":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">تمام عرض</Badge>;
      default:
        return <Badge variant="outline">{size}</Badge>;
    }
  };

  const getBannerTypeBadge = (type: string) => {
    switch (type) {
      case "promotional":
        return <Badge className="bg-pink-500">تبلیغاتی</Badge>;
      case "informational":
        return <Badge className="bg-blue-500">اطلاع‌رسانی</Badge>;
      case "seasonal":
        return <Badge className="bg-amber-500">فصلی</Badge>;
      case "featured-product":
        return <Badge className="bg-green-500">محصول ویژه</Badge>;
      case "category-highlight":
        return <Badge className="bg-purple-500">دسته‌بندی</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            <BannerForm onBannerAdded={handleBannerAdded} />
          </SheetContent>
        </Sheet>
      </div>

      <Card className="backdrop-blur-sm bg-white/60 shadow-xl">
        <CardHeader>
          <CardTitle>لیست بنرها</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              خطا در بارگذاری بنرها
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>بنر</TableHead>
                    <TableHead>موقعیت</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>اندازه</TableHead>
                    <TableHead>مدت زمان</TableHead>
                    <TableHead className="text-center">وضعیت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners && banners.length > 0 ? (
                    banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 rounded overflow-hidden bg-gray-100">
                              <img 
                                src={banner.imageUrl} 
                                alt={banner.title} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{banner.title}</div>
                              {banner.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {banner.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {banner.targetLocation === "homepage" ? "صفحه اصلی" :
                             banner.targetLocation === "product-list" ? "لیست محصولات" :
                             banner.targetLocation === "category-page" ? "صفحه دسته‌بندی" :
                             banner.targetLocation === "checkout" ? "تسویه حساب" :
                             "همه صفحات"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getBannerTypeBadge(banner.type)}
                        </TableCell>
                        <TableCell>
                          {getBannerSizeBadge(banner.size)}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {banner.startDate && (
                              <div>از: {new Date(banner.startDate).toLocaleDateString('fa-IR')}</div>
                            )}
                            {banner.endDate && (
                              <div>تا: {new Date(banner.endDate).toLocaleDateString('fa-IR')}</div>
                            )}
                            {!banner.startDate && !banner.endDate && (
                              <span className="text-muted-foreground">بدون محدودیت زمانی</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {banner.active ? (
                            <Badge variant="default" className="bg-green-500">فعال</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">غیرفعال</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">باز کردن منو</span>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(banner.id, banner.active)}
                              >
                                {banner.active ? (
                                  <>
                                    <EyeOff className="ml-2 h-4 w-4" />
                                    <span>غیرفعال‌سازی</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="ml-2 h-4 w-4" />
                                    <span>فعال‌سازی</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="ml-2 h-4 w-4" />
                                <span>ویرایش</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="ml-2 h-4 w-4" />
                                <span>حذف</span>
                              </DropdownMenuItem>
                              {banner.linkUrl && (
                                <DropdownMenuItem>
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                  <span>مشاهده لینک</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        <div className="flex flex-col items-center py-8">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <PlusCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p>هیچ بنری یافت نشد</p>
                          <p className="text-sm text-muted-foreground mt-1">اولین بنر خود را برای تبلیغ محصولات یا پیشنهادات ایجاد کنید</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
