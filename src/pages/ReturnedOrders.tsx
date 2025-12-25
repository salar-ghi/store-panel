
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface ReturnedOrder {
  id: string;
  customer: string;
  product: string;
  returnDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  details: string;
}

const returnedOrdersMockData: ReturnedOrder[] = [
  {
    id: "RET-001",
    customer: "علی محمدی",
    product: "هدفون بلوتوثی",
    returnDate: "1404/01/15",
    reason: "کالا معیوب است",
    status: "approved",
    details: "هدفون پس از یک روز استفاده دیگر روشن نشد."
  },
  {
    id: "RET-002",
    customer: "سارا احمدی",
    product: "ساعت هوشمند",
    returnDate: "1404/01/12",
    reason: "محصول با تصویر مطابقت ندارد",
    status: "pending",
    details: "رنگ ساعت با تصویر متفاوت است و قابلیت‌های اعلام شده را ندارد."
  },
  {
    id: "RET-003",
    customer: "محمد حسینی",
    product: "لپ تاپ گیمینگ",
    returnDate: "1404/01/10",
    reason: "کالای اشتباه ارسال شده",
    status: "rejected",
    details: "مدل لپ تاپ ارسال شده با سفارش مطابقت ندارد."
  },
  {
    id: "RET-004",
    customer: "نیلوفر رضایی",
    product: "گوشی موبایل",
    returnDate: "1404/01/08",
    reason: "انصراف از خرید",
    status: "approved",
    details: "مشتری از خرید منصرف شده است."
  },
  {
    id: "RET-005",
    customer: "امیر کریمی",
    product: "دوربین عکاسی",
    returnDate: "1404/01/05",
    reason: "کالا معیوب است",
    status: "pending",
    details: "لنز دوربین خراش دارد و فوکوس به درستی انجام نمی‌شود."
  },
];

export default function ReturnedOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<ReturnedOrder | null>(null);
  
  const filteredOrders = returnedOrdersMockData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterStatus || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">سفارشات مرجوعی</h2>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <CardTitle>فیلتر سفارشات</CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="وضعیت سفارش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="pending">در انتظار بررسی</SelectItem>
                  <SelectItem value="approved">تایید شده</SelectItem>
                  <SelectItem value="rejected">رد شده</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="جستجو..."
                  className="w-full pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شناسه</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>محصول</TableHead>
                  <TableHead>دلیل مرجوعی</TableHead>
                  <TableHead>تاریخ درخواست</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.reason}</TableCell>
                      <TableCell>{order.returnDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "approved"
                              ? "bg-success/10 text-success border-success/20"
                              : order.status === "pending"
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {order.status === "approved" 
                            ? "تایید شده" 
                            : order.status === "pending" 
                            ? "در انتظار بررسی" 
                            : "رد شده"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedOrder(order)}
                        >
                          مشاهده جزئیات
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      هیچ سفارش مرجوعی یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>جزئیات مرجوعی {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              اطلاعات کامل درخواست مرجوعی
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">مشتری:</p>
                  <p className="text-sm">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">محصول:</p>
                  <p className="text-sm">{selectedOrder.product}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">تاریخ درخواست:</p>
                  <p className="text-sm">{selectedOrder.returnDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">وضعیت:</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedOrder.status === "approved"
                        ? "bg-success/10 text-success border-success/20"
                        : selectedOrder.status === "pending"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {selectedOrder.status === "approved" 
                      ? "تایید شده" 
                      : selectedOrder.status === "pending" 
                      ? "در انتظار بررسی" 
                      : "رد شده"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">دلیل مرجوعی:</p>
                <p className="text-sm">{selectedOrder.reason}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">توضیحات:</p>
                <p className="text-sm">{selectedOrder.details}</p>
              </div>
              
              {selectedOrder.status === "pending" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">رد درخواست</Button>
                  <Button>تایید مرجوعی</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
