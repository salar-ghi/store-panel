import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Eye } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Order } from "@/types/order";
import { mockOrders, mockProducts, mockCategories, mockBrands } from "@/data/ordersData";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderItemsTable } from "@/components/orders/OrderItemsTable";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleApproveOrder = (order: Order) => {
    setOrders(
      orders.map((o) =>
        o.id === order.id ? { ...o, status: "approved" } : o
      )
    );
    toast.success(`سفارش ${order.id} تایید شد.`);
    setShowViewDialog(false);
    setSelectedOrder(null);
  };

  const handleRejectOrder = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: "rejected" }
            : order
        )
      );
      setShowRejectDialog(false);
      toast.error(`سفارش ${selectedOrder.id} رد شد.`);
      setSelectedOrder(null);
      setRejectReason("");
    }
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowFormDialog(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowFormDialog(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewDialog(true);
  };

  const handleSaveOrder = (
    orderData: Omit<Order, "id" | "date" | "status">
  ) => {
    if (editingOrder) {
      // Update existing order
      setOrders(
        orders.map((order) =>
          order.id === editingOrder.id
            ? { ...order, ...orderData }
            : order
        )
      );
      toast.success(`سفارش ${editingOrder.id} ویرایش شد.`);
    } else {
      // Create new order
      const newOrder: Order = {
        id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
        ...orderData,
        status: "pending",
        date: new Date().toLocaleDateString("fa-IR"),
      };
      setOrders([newOrder, ...orders]);
      toast.success(`سفارش ${newOrder.id} ایجاد شد.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            در انتظار بررسی
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            تایید شده
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            رد شده
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-info/10 text-info border-info/20"
          >
            ارسال شده
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20"
          >
            تحویل داده شده
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">سفارش‌ها</h2>
        <Button onClick={handleCreateOrder}>
          <Plus className="ml-2 h-4 w-4" />
          ایجاد سفارش
        </Button>
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
                  <TableHead>شناسه</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>تعداد اقلام</TableHead>
                  <TableHead>مبلغ کل</TableHead>
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
                    <TableCell>
                      <Badge variant="secondary">
                        {order.items.length} محصول
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-success/10 hover:bg-success/20 text-success border-success/30"
                              onClick={() => handleApproveOrder(order)}
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
              برای ایجاد سفارش جدید روی دکمه "ایجاد سفارش" کلیک کنید
            </p>
          </div>
        </div>
      )}

      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>جزئیات سفارش {selectedOrder?.id}</DialogTitle>
            <DialogDescription>اطلاعات کامل سفارش</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    مشتری
                  </p>
                  <p className="text-sm">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تلفن
                  </p>
                  <p className="text-sm">
                    {selectedOrder.customerPhone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاریخ
                  </p>
                  <p className="text-sm">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    وضعیت
                  </p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {selectedOrder.customerAddress && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    آدرس
                  </p>
                  <p className="text-sm">{selectedOrder.customerAddress}</p>
                </div>
              )}

              <div className="pt-2">
                <p className="mb-2 text-sm font-medium">اقلام سفارش</p>
                <OrderItemsTable items={selectedOrder.items} readonly />
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    رد سفارش
                  </Button>
                  <Button onClick={() => handleApproveOrder(selectedOrder)}>
                    تایید سفارش
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
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
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
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

      {/* Create/Edit Order Dialog */}
      <OrderFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        order={editingOrder}
        products={mockProducts}
        categories={mockCategories}
        brands={mockBrands}
        onSave={handleSaveOrder}
      />
    </div>
  );
}
