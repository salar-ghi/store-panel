import { useState, useEffect, useMemo } from "react";
import { Order, OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSelector } from "./ProductSelector";
import { OrderItemsTable } from "./OrderItemsTable";
import { toast } from "sonner";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  onSave: (order: Omit<Order, "id" | "date" | "status">) => void;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  products,
  categories,
  brands,
  onSave,
}: OrderFormDialogProps) {
  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Map<number, number>>(
    new Map()
  );

  const isEditing = !!order;

  useEffect(() => {
    if (open) {
      if (order) {
        setCustomer(order.customer);
        setCustomerPhone(order.customerPhone || "");
        setCustomerAddress(order.customerAddress || "");
        setNotes(order.notes || "");
        const productMap = new Map<number, number>();
        order.items.forEach((item) => {
          productMap.set(item.productId, item.quantity);
        });
        setSelectedProducts(productMap);
      } else {
        setCustomer("");
        setCustomerPhone("");
        setCustomerAddress("");
        setNotes("");
        setSelectedProducts(new Map());
      }
    }
  }, [open, order]);

  const handleProductSelect = (productId: number, quantity: number) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(productId);
      } else {
        newMap.set(productId, quantity);
      }
      return newMap;
    });
  };

  const orderItems: OrderItem[] = useMemo(() => {
    const items: OrderItem[] = [];
    selectedProducts.forEach((quantity, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        items.push({
          id: productId.toString(),
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId,
          categoryName: product.categoryName || "",
          brandId: product.brandId,
          brandName: product.brandName || "",
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        });
      }
    });
    return items;
  }, [selectedProducts, products]);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleRemoveItem = (productId: number) => {
    handleProductSelect(productId, 0);
  };

  const handleSubmit = () => {
    if (!customer.trim()) {
      toast.error("نام مشتری الزامی است");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("حداقل یک محصول باید انتخاب شود");
      return;
    }

    onSave({
      customer: customer.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: orderItems,
      total: totalAmount,
      notes: notes.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "ویرایش سفارش" : "ایجاد سفارش جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "اطلاعات سفارش را ویرایش کنید"
              : "اطلاعات مشتری و محصولات سفارش را وارد کنید"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">اطلاعات مشتری</TabsTrigger>
            <TabsTrigger value="products">انتخاب محصولات</TabsTrigger>
            <TabsTrigger value="summary">
              خلاصه سفارش ({orderItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">نام مشتری *</Label>
                <Input
                  id="customer"
                  placeholder="نام و نام خانوادگی"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس</Label>
                <Input
                  id="phone"
                  placeholder="09123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">آدرس</Label>
              <Textarea
                id="address"
                placeholder="آدرس کامل"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">توضیحات</Label>
              <Textarea
                id="notes"
                placeholder="توضیحات اضافی سفارش..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="products" className="pt-4">
            <ProductSelector
              products={products}
              categories={categories}
              brands={brands}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
            />
          </TabsContent>

          <TabsContent value="summary" className="pt-4">
            <OrderItemsTable
              items={orderItems}
              onRemoveItem={handleRemoveItem}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-lg font-bold">
            جمع کل: {totalAmount.toLocaleString("fa-IR")} تومان
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "ذخیره تغییرات" : "ثبت سفارش"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
