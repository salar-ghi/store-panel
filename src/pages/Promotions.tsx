import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Percent, Plus, Loader2 } from "lucide-react";
import { DiscountForm } from "@/components/promotions/DiscountForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PromotionService } from "@/services/promotion-service";
import { Discount } from "@/types/promotion";
import { formatPersianDateShort, toPersianDigits } from "@/lib/persian-date";

function getStatus(d: Discount): "active" | "expired" | "inactive" {
  if (!d.isActive) return "inactive";
  const now = new Date();
  if (new Date(d.endDate) < now) return "expired";
  return "active";
}

export default function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDiscountFormOpen, setIsDiscountFormOpen] = useState(false);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ["discounts"],
    queryFn: () => PromotionService.getAllDiscounts(),
  });

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = discounts.filter((d) => getStatus(d) === "active").length;
  const expiredCount = discounts.filter((d) => getStatus(d) === "expired").length;
  const inactiveCount = discounts.filter((d) => getStatus(d) === "inactive").length;

  return (
    <div className="space-y-6  py-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">تخفیف‌ها</h2>
        <Button onClick={() => setIsDiscountFormOpen(true)}>
          <Plus className="ml-2 h-4 w-4" /> تخفیف جدید
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی کد تخفیف..."
            className="w-full pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تخفیف‌های فعال
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {toPersianDigits(activeCount)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {toPersianDigits(activeCount)} تخفیف از {toPersianDigits(discounts.length)} تخفیف
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تخفیف‌های منقضی شده
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {toPersianDigits(expiredCount)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {toPersianDigits(expiredCount)} تخفیف از {toPersianDigits(discounts.length)} تخفیف
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تخفیف‌های غیرفعال
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {toPersianDigits(inactiveCount)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {toPersianDigits(inactiveCount)} تخفیف از {toPersianDigits(discounts.length)} تخفیف
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تخفیف‌ها</CardTitle>
          <CardDescription>مدیریت کدهای تخفیف فروشگاه</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شناسه</TableHead>
                <TableHead>کد تخفیف</TableHead>
                <TableHead>مقدار</TableHead>
                <TableHead>تاریخ شروع</TableHead>
                <TableHead>تاریخ پایان</TableHead>
                <TableHead>تعداد استفاده</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => {
                  const status = getStatus(discount);
                  return (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">{discount.id}</TableCell>
                      <TableCell>{discount.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                          {discount.discountType === "percentage"
                            ? `${toPersianDigits(discount.amount)}٪`
                            : `${toPersianDigits(discount.amount.toLocaleString())} تومان`}
                        </div>
                      </TableCell>
                      <TableCell>{formatPersianDateShort(discount.startDate)}</TableCell>
                      <TableCell>{formatPersianDateShort(discount.endDate)}</TableCell>
                      <TableCell>{toPersianDigits(discount.usedCount ?? 0)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            status === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : status === "expired"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {status === "active"
                            ? "فعال"
                            : status === "expired"
                            ? "منقضی شده"
                            : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline">
                            ویرایش
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                          >
                            غیرفعال
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    هیچ کد تخفیفی یافت نشد.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline">صادرات به اکسل</Button>
        </CardFooter>
      </Card>

      <DiscountForm open={isDiscountFormOpen} onOpenChange={setIsDiscountFormOpen} />
    </div>
  );
}
