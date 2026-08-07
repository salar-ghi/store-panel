import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, ShoppingCart, Clock, Trash2, Bell, Pencil, Plus, Minus, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { BasketService } from "@/services/basket-service";
import { Basket, BasketItem, BasketStatusLabels, BasketStatus } from "@/types/basket";
import { formatPersianNumber, formatPrice } from "@/lib/format";
import { formatJalaaliDateTime } from "@/lib/persian-date";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BasketStatus, string> = {
  active: "bg-success/10 text-success border-success/20",
  abandoned: "bg-warning/10 text-warning border-warning/20",
  converted: "bg-primary/10 text-primary border-primary/20",
  merged: "bg-muted text-muted-foreground border-border",
};

function ageLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${formatPersianNumber(mins)} دقیقه`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${formatPersianNumber(hours)} ساعت`;
  return `${formatPersianNumber(Math.floor(hours / 24))} روز`;
}

function safeDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  try {
    return formatJalaaliDateTime ? formatJalaaliDateTime(d) : d.toLocaleString("fa-IR");
  } catch {
    return d.toLocaleString("fa-IR");
  }
}

export function BasketsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BasketStatus | "all">("all");
  const [editing, setEditing] = useState<Basket | null>(null);
  const [draftItems, setDraftItems] = useState<BasketItem[]>([]);
  const [draftNotes, setDraftNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Basket | null>(null);

  const { data: baskets = [], isLoading, isError } = useQuery({
    queryKey: ["baskets"],
    queryFn: () => BasketService.list(),
    retry: false,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["baskets"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      return BasketService.update(editing.id, {
        items: draftItems.map(({ id, ...rest }) => rest),
        notes: draftNotes,
      });
    },
    onSuccess: () => {
      toast.success("سبد خرید بروزرسانی شد");
      setEditing(null);
      refresh();
    },
    onError: () => toast.error("خطا در بروزرسانی سبد خرید"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BasketService.remove(id),
    onSuccess: () => {
      toast.success("سبد خرید حذف شد");
      setDeleteTarget(null);
      refresh();
    },
    onError: () => toast.error("خطا در حذف سبد خرید"),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => BasketService.convertToOrder(id),
    onSuccess: (res) => {
      toast.success(`سفارش ${res?.orderId ?? ""} از سبد خرید ایجاد شد`);
      refresh();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("خطا در تبدیل سبد به سفارش"),
  });

  const remindMutation = useMutation({
    mutationFn: (id: string) => BasketService.remind(id),
    onSuccess: () => toast.success("یادآوری برای مشتری ارسال شد"),
    onError: () => toast.error("خطا در ارسال یادآوری"),
  });

  const kpis = useMemo(() => {
    const active = baskets.filter((b) => b.status === "active");
    const abandoned = baskets.filter((b) => b.status === "abandoned");
    const value = baskets
      .filter((b) => b.status === "active" || b.status === "abandoned")
      .reduce((a, b) => a + (b.total ?? 0), 0);
    const items = baskets.reduce((a, b) => a + (b.items?.length ?? 0), 0);
    return { active: active.length, abandoned: abandoned.length, value, items };
  }, [baskets]);

  const filtered = baskets.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.customerName ?? "").toLowerCase().includes(q) ||
      (b.customerPhone ?? "").includes(q) ||
      (b.id ?? "").toLowerCase().includes(q)
    );
  });

  const openEdit = (b: Basket) => {
    setEditing(b);
    setDraftItems((b.items ?? []).map((i) => ({ ...i })));
    setDraftNotes(b.notes ?? "");
  };

  const changeQty = (index: number, delta: number) => {
    setDraftItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const q = Math.max(0, Number((it.quantity + delta).toFixed(2)));
        return { ...it, quantity: q, totalPrice: Math.round(q * it.unitPrice) };
      }),
    );
  };

  const removeItem = (index: number) => setDraftItems((prev) => prev.filter((_, i) => i !== index));

  const draftTotal = draftItems.reduce((a, i) => a + (i.totalPrice ?? 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "سبدهای فعال", value: formatPersianNumber(kpis.active), icon: ShoppingCart, tone: "text-success bg-success/10" },
          { label: "سبدهای رهاشده", value: formatPersianNumber(kpis.abandoned), icon: Clock, tone: "text-warning bg-warning/10" },
          { label: "ارزش سبدهای باز", value: formatPrice(kpis.value), icon: PackageCheck, tone: "text-primary bg-primary/10" },
          { label: "مجموع اقلام", value: formatPersianNumber(kpis.items), icon: Plus, tone: "text-muted-foreground bg-muted" },
        ].map((k) => (
          <Card key={k.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn("rounded-xl p-2.5", k.tone)}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="truncate text-lg font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-base">سبدهای خرید کاربران</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "active", "abandoned", "converted"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s as BasketStatus | "all")}
              >
                {s === "all" ? "همه" : BasketStatusLabels[s as BasketStatus]}
              </Button>
            ))}
            <div className="relative w-56">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی مشتری یا شناسه..."
                className="pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              سرویس سبد خرید در دسترس نیست. اندپوینت <code>/api/Basket/baskets</code> را در بک‌اند فعال کنید.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              سبد خریدی یافت نشد
            </div>
          ) : (
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead>مشتری</TableHead>
                  <TableHead>اقلام</TableHead>
                  <TableHead>ارزش سبد</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>مدت باز بودن</TableHead>
                  <TableHead>آخرین تغییر</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{b.customerName || "مهمان"}</p>
                      <p className="text-xs text-muted-foreground">{b.customerPhone || b.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatPersianNumber(b.items?.length ?? 0)} قلم</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(b.total ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[b.status] ?? ""}>
                        {BasketStatusLabels[b.status] ?? b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ageLabel(b.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{safeDate(b.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={b.status === "converted"}
                          onClick={() => convertMutation.mutate(b.id)}
                        >
                          تبدیل به سفارش
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => remindMutation.mutate(b.id)}>
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => setDeleteTarget(b)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit basket */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش سبد خرید {editing?.customerName}</DialogTitle>
            <DialogDescription>
              اقلام سبد را ویرایش کنید؛ تغییرات برای مشتری در فروشگاه نیز اعمال می‌شود.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto pl-1">
            {draftItems.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">سبد خالی است</p>
            )}
            {draftItems.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(index, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm">{formatPersianNumber(item.quantity)}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(index, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="w-28 text-left text-sm font-medium">{formatPrice(item.totalPrice)}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">جمع کل سبد</span>
            <span className="text-base font-bold">{formatPrice(draftTotal)}</span>
          </div>

          <Textarea
            placeholder="یادداشت داخلی برای این سبد..."
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              انصراف
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره تغییرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سبد خرید</AlertDialogTitle>
            <AlertDialogDescription>
              سبد خرید «{deleteTarget?.customerName}» حذف می‌شود. این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
