
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
import { Search, Percent, Plus } from "lucide-react";
import { DiscountForm } from "@/components/promotions/DiscountForm";
import { useState } from "react";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  amount: string;
  startDate: string;
  endDate: string;
  usedCount: number;
  status: "active" | "expired" | "used";
}

const discountsMockData: Discount[] = [
  {
    id: "DISC-001",
    code: "SUMMER50",
    type: "percentage",
    amount: "۵۰٪",
    startDate: "۱۴۰۴/۰۲/۰۱",
    endDate: "۱۴۰۴/۰۴/۳۱",
    usedCount: 24,
    status: "active",
  },
  {
    id: "DISC-002",
    code: "WELCOME20",
    type: "percentage",
    amount: "۲۰٪",
    startDate: "۱۴۰۴/۰۱/۰۱",
    endDate: "۱۴۰۴/۱۲/۲۹",
    usedCount: 156,
    status: "active",
  },
  {
    id: "DISC-003",
    code: "NEWYEAR",
    type: "fixed",
    amount: "۵۰,۰۰۰ تومان",
    startDate: "۱۴۰۳/۱۲/۲۰",
    endDate: "۱۴۰۴/۰۱/۲۰",
    usedCount: 98,
    status: "expired",
  },
  {
    id: "DISC-004",
    code: "FLASH25",
    type: "percentage",
    amount: "۲۵٪",
    startDate: "۱۴۰۴/۰۲/۱۰",
    endDate: "۱۴۰۴/۰۲/۱۲",
    usedCount: 50,
    status: "used",
  },
  {
    id: "DISC-005",
    code: "LOYAL10",
    type: "percentage",
    amount: "۱۰٪",
    startDate: "۱۴۰۴/۰۱/۰۱",
    endDate: "۱۴۰۴/۱۲/۲۹",
    usedCount: 42,
    status: "active",
  },
];

export default function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDiscountFormOpen, setIsDiscountFormOpen] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>(discountsMockData);

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {discounts.filter((d) => d.status === "active").length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {discounts.filter((d) => d.status === "active").length} تخفیف از{" "}
              {discounts.length} تخفیف
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تخفیف‌های منقضی شده
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {discounts.filter((d) => d.status === "expired").length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {discounts.filter((d) => d.status === "expired").length} تخفیف از{" "}
              {discounts.length} تخفیف
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تخفیف‌های استفاده شده
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {discounts.filter((d) => d.status === "used").length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {discounts.filter((d) => d.status === "used").length} تخفیف از{" "}
              {discounts.length} تخفیف
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
              {filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.id}</TableCell>
                    <TableCell>{discount.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                        {discount.amount}
                      </div>
                    </TableCell>
                    <TableCell>{discount.startDate}</TableCell>
                    <TableCell>{discount.endDate}</TableCell>
                    <TableCell>{discount.usedCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          discount.status === "active"
                            ? "bg-success/10 text-success border-success/20"
                            : discount.status === "expired"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {discount.status === "active"
                          ? "فعال"
                          : discount.status === "expired"
                          ? "منقضی شده"
                          : "استفاده شده"}
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
                ))
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
        <CardFooter className="flex justify-between">
          <Button variant="outline">صادرات به اکسل</Button>
          <Button onClick={() => setIsDiscountFormOpen(true)}>
            <Plus className="ml-2 h-4 w-4" /> تخفیف جدید
          </Button>
        </CardFooter>
      </Card>

      <DiscountForm
        open={isDiscountFormOpen}
        onOpenChange={setIsDiscountFormOpen}
      />
    </div>
  );
}
