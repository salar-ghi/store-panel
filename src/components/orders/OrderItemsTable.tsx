import { OrderItem } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItemsTableProps {
  items: OrderItem[];
  onRemoveItem?: (productId: number) => void;
  readonly?: boolean;
}

export function OrderItemsTable({
  items,
  onRemoveItem,
  readonly = false,
}: OrderItemsTableProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (items.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
        هیچ محصولی انتخاب نشده است
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>محصول</TableHead>
            <TableHead>دسته‌بندی</TableHead>
            <TableHead>برند</TableHead>
            <TableHead className="text-center">تعداد</TableHead>
            <TableHead>قیمت واحد</TableHead>
            <TableHead>جمع</TableHead>
            {!readonly && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.categoryName}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.brandName}</Badge>
              </TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell>{formatPrice(item.unitPrice)}</TableCell>
              <TableCell className="font-medium">
                {formatPrice(item.totalPrice)}
              </TableCell>
              {!readonly && onRemoveItem && (
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end border-t pt-3">
        <div className="text-lg font-bold">
          جمع کل: {formatPrice(totalAmount)}
        </div>
      </div>
    </div>
  );
}
