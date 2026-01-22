
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { getProductPrice, getProductStock } from "@/data/ordersData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ViewProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({ product, open, onOpenChange }: ViewProductDialogProps) {
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>جزئیات محصول</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">نام محصول</h4>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">وضعیت</h4>
              <div className="flex gap-2">
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status === 'active' ? 'فعال' : 'غیرفعال'}
                </Badge>
                <Badge variant={
                  product.availability === 'available' ? 'default' : 
                  product.availability === 'unavailable' ? 'secondary' : 
                  product.availability === 'discontinued' ? 'destructive' :
                  product.availability === 'out_of_stock' ? 'outline' : 'secondary'
                }>
                  {product.availability === 'available' ? 'موجود' : 
                   product.availability === 'unavailable' ? 'ناموجود' : 
                   product.availability === 'discontinued' ? 'متوقف شده' :
                   product.availability === 'out_of_stock' ? 'تمام شده' : 'پیش‌نویس'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">توضیحات</h4>
            <p className="text-sm">{product.description || 'توضیحاتی ثبت نشده'}</p>
          </div>

          <Separator />

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">قیمت فروش</h4>
              <p className="text-lg font-bold text-primary">{price.toLocaleString()} تومان</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">موجودی کل</h4>
              <p className="text-lg font-bold">{stock}</p>
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">دسته‌بندی</h4>
              <p>{product.categoryName || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">برند</h4>
              <p>{product.brandName || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">تأمین‌کننده</h4>
              <p>{product.supplierName || '-'}</p>
            </div>
          </div>

          {/* Dimensions */}
          {product.dimensions && (
            <>
              <Separator />
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">ابعاد و وزن</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">طول:</span>{' '}
                      {product.dimensions.length} {product.dimensions.dimensionUnit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">عرض:</span>{' '}
                      {product.dimensions.width} {product.dimensions.dimensionUnit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">ارتفاع:</span>{' '}
                      {product.dimensions.height} {product.dimensions.dimensionUnit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">وزن:</span>{' '}
                      {product.dimensions.weight} {product.dimensions.weightUnit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Price Batches */}
          {product.prices && product.prices.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">سری‌های وارداتی</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    {product.prices.map((p, index) => (
                      <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{p.batchNumber || `سری ${index + 1}`}</Badge>
                          <span className="text-muted-foreground">{p.effectiveDate}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>تعداد: {p.quantity - (p.soldQuantity || 0)}/{p.quantity}</span>
                          <span className="font-medium">{p.amount.toLocaleString()} {p.currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">ویژگی‌ها</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-muted-foreground">{attr.key}:</span>{' '}
                        <span className="font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">تگ‌ها</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
