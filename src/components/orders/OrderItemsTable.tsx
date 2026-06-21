import { OrderItem } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Boxes, Scale } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockLocation } from "@/services/inventory-engine";
import { formatPrice, formatPersianNumber } from "@/lib/format";

interface OrderItemsTableProps {
  items: OrderItem[];
  onRemoveItem?: (productId: number) => void;
  /** productId -> available shelf locations (already scoped). Required for editable mode. */
  locationsByProduct?: Record<number, StockLocation[]>;
  onChangeShelf?: (productId: number, shelfId: number) => void;
  readonly?: boolean;
}

export function OrderItemsTable({
  items,
  onRemoveItem,
  locationsByProduct,
  onChangeShelf,
  readonly = false,
}: OrderItemsTableProps) {
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
            <TableHead>محل برداشت (Space / Zone / Shelf)</TableHead>
            <TableHead className="text-center">تعداد</TableHead>
            <TableHead>قیمت واحد</TableHead>
            <TableHead>جمع</TableHead>
            {!readonly && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const locs = locationsByProduct?.[item.productId] ?? [];
            const showSelect = !readonly && locs.length > 0 && onChangeShelf;
            const shelfBadge =
              item.shelfCode || locs.find((l) => l.shelfId === item.shelfId)?.shelfCode;
            const insufficient =
              showSelect &&
              item.shelfId &&
              (locs.find((l) => l.shelfId === item.shelfId)?.available ?? 0) <
                item.quantity;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>{item.productName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.brandName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.categoryName}</Badge>
                </TableCell>
                <TableCell>
                  {showSelect ? (
                    <div className="space-y-1">
                      <Select
                        value={item.shelfId ? item.shelfId.toString() : undefined}
                        onValueChange={(v) =>
                          onChangeShelf!(item.productId, parseInt(v))
                        }
                      >
                        <SelectTrigger className="h-9 w-full min-w-[260px]">
                          <SelectValue placeholder="انتخاب قفسه" />
                        </SelectTrigger>
                        <SelectContent>
                          {locs.map((l) => (
                            <SelectItem key={l.shelfId} value={l.shelfId.toString()}>
                              <div className="flex flex-col text-right">
                                <span className="font-medium">
                                  {l.shelfCode}
                                  {l.shelfName && (
                                    <span className="text-muted-foreground">
                                      {" — "}
                                      {l.shelfName}
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {l.spaceName}
                                  {l.zoneName ? ` / ${l.zoneName}` : ""} • موجودی{" "}
                                  {l.available.toLocaleString("fa-IR")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {insufficient && (
                        <p className="text-xs text-destructive">
                          موجودی این قفسه برای تعداد درخواست‌شده کافی نیست
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {item.spaceName && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.spaceName}
                        </Badge>
                      )}
                      {item.zoneName && (
                        <Badge variant="outline">{item.zoneName}</Badge>
                      )}
                      {shelfBadge && (
                        <Badge className="gap-1">
                          <Boxes className="h-3 w-3" />
                          {shelfBadge}
                        </Badge>
                      )}
                      {!item.shelfId && !shelfBadge && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  )}
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
            );
          })}
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
