
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  PackageOpen, 
  Search, 
  Calendar, 
  User, 
  Info, 
  ArrowLeft, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for rejected orders
const mockReturnedOrders = [
  { 
    id: "RET-001", 
    originalOrder: "ORD-7845", 
    customer: "علی محمدی", 
    date: "1402/02/12", 
    items: 2, 
    reason: "کالای آسیب‌دیده", 
    status: "در انتظار بررسی",
    amount: 1250000
  },
  { 
    id: "RET-002", 
    originalOrder: "ORD-6932", 
    customer: "نیلوفر احمدی", 
    date: "1402/02/15", 
    items: 1, 
    reason: "محصول اشتباه", 
    status: "تایید شده",
    amount: 850000
  },
  { 
    id: "RET-003", 
    originalOrder: "ORD-7201", 
    customer: "رضا کریمی", 
    date: "1402/02/18", 
    items: 3, 
    reason: "عدم رضایت", 
    status: "تایید شده",
    amount: 2350000
  },
  { 
    id: "RET-004", 
    originalOrder: "ORD-7512", 
    customer: "مریم حسینی", 
    date: "1402/02/20", 
    items: 1, 
    reason: "کالای آسیب‌دیده", 
    status: "رد شده",
    amount: 1500000
  },
  { 
    id: "RET-005", 
    originalOrder: "ORD-7623", 
    customer: "سعید رضایی", 
    date: "1402/02/22", 
    items: 2, 
    reason: "محصول اشتباه", 
    status: "در انتظار بررسی",
    amount: 3200000
  },
];

// Reason type map
const reasonTypeMap = {
  "کالای آسیب‌دیده": { color: "text-red-500", bg: "bg-red-100" },
  "محصول اشتباه": { color: "text-amber-500", bg: "bg-amber-100" },
  "عدم رضایت": { color: "text-blue-500", bg: "bg-blue-100" },
};

// Status badge map
const statusBadgeMap: Record<string, string> = {
  "در انتظار بررسی": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "تایید شده": "bg-green-100 text-green-800 hover:bg-green-200",
  "رد شده": "bg-red-100 text-red-800 hover:bg-red-200",
};

export default function ReturnedOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockReturnedOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.originalOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalReturnsAmount = filteredOrders.reduce((sum, order) => {
    return order.status === "تایید شده" ? sum + order.amount : sum;
  }, 0);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">سفارشات مرجوعی</h2>
          <p className="text-muted-foreground">مدیریت و بررسی سفارشات مرجوع شده</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          بازگشت به سفارشات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-red-500" />
              آمار مرجوعی‌ها
            </CardTitle>
            <CardDescription>خلاصه وضعیت سفارشات مرجوعی</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-muted-foreground text-sm">کل مرجوعی‌ها</div>
                <div className="text-2xl font-bold">{mockReturnedOrders.length}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-muted-foreground text-sm">در انتظار</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {mockReturnedOrders.filter(o => o.status === "در انتظار بررسی").length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-muted-foreground text-sm">تایید شده</div>
                <div className="text-2xl font-bold text-green-600">
                  {mockReturnedOrders.filter(o => o.status === "تایید شده").length}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-muted-foreground text-sm">رد شده</div>
                <div className="text-2xl font-bold text-red-600">
                  {mockReturnedOrders.filter(o => o.status === "رد شده").length}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-muted-foreground text-sm">ارزش مرجوعی‌های تایید شده</div>
              <div className="text-2xl font-bold text-purple-600">
                {totalReturnsAmount.toLocaleString()} تومان
              </div>
            </div>

            <div className="p-4 mt-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">دلایل مرجوعی</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>کالای آسیب‌دیده</span>
                  <span className="font-medium">
                    {mockReturnedOrders.filter(o => o.reason === "کالای آسیب‌دیده").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>محصول اشتباه</span>
                  <span className="font-medium">
                    {mockReturnedOrders.filter(o => o.reason === "محصول اشتباه").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>عدم رضایت</span>
                  <span className="font-medium">
                    {mockReturnedOrders.filter(o => o.reason === "عدم رضایت").length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>لیست سفارشات مرجوعی</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو در مرجوعی‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="فیلتر بر اساس وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="در انتظار بررسی">در انتظار بررسی</SelectItem>
                  <SelectItem value="تایید شده">تایید شده</SelectItem>
                  <SelectItem value="رد شده">رد شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شناسه مرجوعی</TableHead>
                    <TableHead>شماره سفارش</TableHead>
                    <TableHead>مشتری</TableHead>
                    <TableHead>تاریخ مرجوعی</TableHead>
                    <TableHead>تعداد اقلام</TableHead>
                    <TableHead>دلیل مرجوعی</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.originalOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {order.customer}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {order.date}
                        </div>
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          reasonTypeMap[order.reason as keyof typeof reasonTypeMap]?.bg || "bg-gray-100"
                        } ${
                          reasonTypeMap[order.reason as keyof typeof reasonTypeMap]?.color || "text-gray-800"
                        }`}>
                          {order.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusBadgeMap[order.status]}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" title="جزئیات مرجوعی">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="مشاهده سفارش اصلی">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="py-6 text-center text-muted-foreground">
                  هیچ سفارش مرجوعی با این مشخصات یافت نشد
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                نمایش {filteredOrders.length} از {mockReturnedOrders.length} مورد
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8">
                  1
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
