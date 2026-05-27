import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { getProductPrice, getProductStock } from "@/data/ordersData";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Tag as TagIcon,
  Layers,
  Ruler,
  Boxes,
  CircleDollarSign,
  Sparkles,
  Building2,
  Truck,
  ImageOff,
  Hash,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ViewProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({ product, open, onOpenChange }: ViewProductDialogProps) {
  const price = getProductPrice(product);
  const stock = getProductStock(product);
  const lowStock = stock <= (product.reorderLevel ?? 5);
  const cover = product.coverImage || product.images?.[0];

  const statusLabel = product.status === "active" ? "فعال" : "غیرفعال";
  const availabilityLabel =
    product.availability === "available"
      ? "موجود"
      : product.availability === "unavailable"
      ? "ناموجود"
      : product.availability === "discontinued"
      ? "متوقف شده"
      : product.availability === "out_of_stock"
      ? "تمام شده"
      : "پیش‌نویس";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0"
        dir="rtl"
      >
        {/* Hero */}
        <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          </div>

          <div className="relative p-6 flex items-start gap-5">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border bg-muted shadow-lg shrink-0 flex items-center justify-center">
              {cover ? (
                <img src={cover} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="w-10 h-10 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <DialogHeader className="space-y-1 text-right">
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-xs">
                  <Hash className="w-3 h-3" />
                  شناسه محصول: {product.id}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant={product.status === "active" ? "default" : "secondary"}
                  className="gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {statusLabel}
                </Badge>
                <Badge
                  variant={
                    product.availability === "available"
                      ? "default"
                      : product.availability === "discontinued"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {availabilityLabel}
                </Badge>
                {lowStock && stock > 0 && (
                  <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    موجودی کم
                  </Badge>
                )}
                {product.categoryName && (
                  <Badge variant="outline" className="gap-1">
                    <Layers className="w-3 h-3" /> {product.categoryName}
                  </Badge>
                )}
                {product.brandName && (
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="w-3 h-3" /> {product.brandName}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="relative grid grid-cols-3 gap-px bg-border/50 border-t">
            <KpiBlock
              icon={<CircleDollarSign className="w-4 h-4" />}
              label="قیمت فروش"
              value={`${price.toLocaleString()} تومان`}
              accent="text-primary"
            />
            <KpiBlock
              icon={<Boxes className="w-4 h-4" />}
              label="موجودی کل"
              value={stock.toLocaleString()}
              accent={lowStock ? "text-amber-600" : "text-foreground"}
            />
            <KpiBlock
              icon={<TrendingUp className="w-4 h-4" />}
              label="حد سفارش مجدد"
              value={(product.reorderLevel ?? 0).toLocaleString()}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs defaultValue="overview" dir="rtl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">کلیات</TabsTrigger>
              <TabsTrigger value="specs">مشخصات</TabsTrigger>
              <TabsTrigger value="batches">سری‌ها</TabsTrigger>
              <TabsTrigger value="variants">تنوع</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-5 space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Package className="w-3.5 h-3.5" />
                  توضیحات
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {product.description || "توضیحاتی ثبت نشده است."}
                </p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoTile
                  icon={<Layers className="w-4 h-4" />}
                  label="دسته‌بندی"
                  value={product.categoryName || "—"}
                />
                <InfoTile
                  icon={<Building2 className="w-4 h-4" />}
                  label="برند"
                  value={product.brandName || "—"}
                />
                <InfoTile
                  icon={<Truck className="w-4 h-4" />}
                  label="تأمین‌کننده"
                  value={product.supplierName || "—"}
                />
              </div>

              {product.stock && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                    <Boxes className="w-3.5 h-3.5" />
                    محل نگهداری
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <MiniField label="فضا" value={product.stock.spaceName || "—"} />
                    <MiniField label="منطقه" value={product.stock.zoneName || "—"} />
                    <MiniField label="قفسه" value={product.stock.shelfCode || "—"} />
                    <MiniField label="واحد" value={product.stock.quantityUnit} />
                  </div>
                </Card>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <TagIcon className="w-3.5 h-3.5" />
                    تگ‌ها
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t, i) => (
                      <Badge key={i} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Specs */}
            <TabsContent value="specs" className="mt-5 space-y-4">
              {product.dimensions ? (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                    <Ruler className="w-3.5 h-3.5" />
                    ابعاد و وزن
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <MiniField
                      label="طول"
                      value={`${product.dimensions.length} ${product.dimensions.dimensionUnit}`}
                    />
                    <MiniField
                      label="عرض"
                      value={`${product.dimensions.width} ${product.dimensions.dimensionUnit}`}
                    />
                    <MiniField
                      label="ارتفاع"
                      value={`${product.dimensions.height} ${product.dimensions.dimensionUnit}`}
                    />
                    <MiniField
                      label="وزن"
                      value={`${product.dimensions.weight} ${product.dimensions.weightUnit}`}
                    />
                  </div>
                </Card>
              ) : (
                <EmptyHint text="ابعاد و وزن ثبت نشده است." />
              )}

              {product.attributes && product.attributes.length > 0 ? (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    ویژگی‌ها
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.attributes.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 bg-muted/30"
                      >
                        <span className="text-muted-foreground">{a.key}</span>
                        <span className="font-medium">{a.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <EmptyHint text="ویژگی خاصی ثبت نشده است." />
              )}
            </TabsContent>

            {/* Batches */}
            <TabsContent value="batches" className="mt-5">
              {product.prices && product.prices.length > 0 ? (
                <div className="space-y-2">
                  {product.prices.map((p, i) => {
                    const remaining = p.quantity - (p.soldQuantity || 0);
                    const sold = p.soldQuantity || 0;
                    const pct = p.quantity ? Math.min(100, (sold / p.quantity) * 100) : 0;
                    return (
                      <Card key={i} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {p.batchNumber || `سری ${i + 1}`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {p.effectiveDate}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {p.amount.toLocaleString()} {p.currency}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>باقیمانده: {remaining}</span>
                          <span>کل: {p.quantity}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-l from-primary to-primary/60"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyHint text="سری وارداتی ثبت نشده است." />
              )}
            </TabsContent>

            {/* Variants */}
            <TabsContent value="variants" className="mt-5 space-y-4">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((v, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{v.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {v.type}
                        </Badge>
                      </div>
                      {v.required && <Badge variant="secondary">الزامی</Badge>}
                    </div>
                    <Separator className="mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((o, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs border rounded-lg px-3 py-1.5 bg-muted/30"
                        >
                          {v.type === "color" && (
                            <span
                              className="w-3 h-3 rounded-full border"
                              style={{ background: o.value }}
                            />
                          )}
                          <span className="font-medium">{o.name}</span>
                          {o.priceAdjustment ? (
                            <span className="text-muted-foreground">
                              ({o.priceAdjustment > 0 ? "+" : ""}
                              {o.priceAdjustment.toLocaleString()})
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyHint text="تنوعی برای این محصول تعریف نشده است." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KpiBlock({
  icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-card/60 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-xl border bg-card hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
      {text}
    </div>
  );
}
