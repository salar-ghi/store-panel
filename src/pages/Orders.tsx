
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Order {
  id: string;
  customer: string;
  product: string;
  total: string;
  status: "pending" | "approved" | "rejected" | "shipped" | "delivered";
  date: string;
}

const ordersMockData: Order[] = [
  {
    id: "ORD-001",
    customer: "رضا محمدی",
    product: "هدفون بی‌سیم",
    total: "۱۲۹,۰۰۰ تومان",
    status: "pending",
    date: "۱۴۰۴/۰۲/۰۵",
  },
  {
    id: "ORD-002",
    customer: "مریم احمدی",
    product: "ساعت هوشمند",
    total: "۲۴۹,۰۰۰ تومان",
    status: "approved",
    date: "۱۴۰۴/۰۲/۰۵",
  },
  {
    id: "ORD-003",
    customer: "علی رضایی",
    product: "پایه لپ‌تاپ",
    total: "۳۹,۰۰۰ تومان",
    status: "shipped",
    date: "۱۴۰۴/۰۲/۰۴",
  },
  {
    id: "ORD-004",
    customer: "الهه داوودی",
    product: "اسپیکر بلوتوثی",
    total: "۷۹,۰۰۰ تومان",
    status: "delivered",
    date: "۱۴۰۴/۰۲/۰۴",
  },
  {
    id: "ORD-005",
    customer: "محمد ولایتی",
    product: "کیبورد مکانیکی",
    total: "۱۴۹,۰۰۰ تومان",
    status: "rejected",
    date: "۱۴۰۴/۰۲/۰۳",
  },
  {
    id: "ORD-006",
    customer: "زهرا کریمی",
    product: "موس گیمینگ",
    total: "۸۹,۰۰۰ تومان",
    status: "pending",
    date: "۱۴۰۴/۰۲/۰۱",
  },
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(ordersMockData);
  
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: "approved" } 
          : order
      ));
      toast.success(`سفارش ${selectedOrder.id} تایید شد.`);
      setSelectedOrder(null);
    }
  };

  const handleRejectOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: "rejected" } 
          : order
      ));
      setShowRejectDialog(false);
      toast.error(`سفارش ${selectedOrder.id} رد شد.`);
      setSelectedOrder(null);
      setRejectReason("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">در انتظار بررسی</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">تایید شده</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">رد شده</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-info/10 text-info border-info/20">ارسال شده</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">تحویل داده شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 py-6 animate-fade-in">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredOrders.length > 0 ? (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>لیست سفارش‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شناسه سفارش</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>محصول</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          مشاهده
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-success/10 hover:bg-success/20 text-success border-success/30"
                              onClick={() => {
                                setSelectedOrder(order);
                                handleApproveOrder();
                              }}
                            >
                              تایید
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRejectDialog(true);
                              }}
                            >
                              رد
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">سفارشی یافت نشد</h3>
            <p className="text-sm text-muted-foreground">
              پس از ثبت سفارش توسط مشتریان، سفارش‌ها در اینجا نمایش داده می‌شوند
            </p>
          </div>
        </div>
      )}

      <Dialog open={selectedOrder !== null && !showRejectDialog} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات سفارش {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              اطلاعات کامل سفارش
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
                  <p className="text-sm font-medium">تاریخ سفارش:</p>
                  <p className="text-sm">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">مبلغ کل:</p>
                  <p className="text-sm">{selectedOrder.total}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">وضعیت:</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              
              {selectedOrder.status === "pending" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(true);
                    }}
                  >
                    رد سفارش
                  </Button>
                  <Button onClick={handleApproveOrder}>تایید سفارش</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رد سفارش</DialogTitle>
            <DialogDescription>
              لطفا دلیل رد سفارش را وارد کنید.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="دلیل رد سفارش را وارد کنید..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              انصراف
            </Button>
            <Button 
              variant="default" 
              onClick={handleRejectOrder}
              disabled={!rejectReason}
            >
              تایید و رد سفارش
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
