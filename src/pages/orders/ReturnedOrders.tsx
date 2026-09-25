import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PackageOpen, Search, Plus, ArrowRight, Clock, CheckCircle2, XCircle, Wallet, RefreshCw, Eye, Undo2 } from "lucide-react";
import { ReturnOrderDialog } from "@/components/orders/ReturnOrderDialog";
import { OrderService } from "@/services/order-service";
import { ReturnReasonLabels } from "@/types/order";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type RetStatus = "pending" | "approved" | "rejected" | "completed";

interface ReturnRow {
  id: string;
  orderId: string;
  customer: string;
  date?: string;
  itemsCount: number;
  totalRefund: number;
  reason?: string;
  status: RetStatus;
  items: any[];
  refunds: any[];
  notes?: string;
}

const statusMeta: Record<RetStatus, { label: string; cls: string; icon: any }> = {
  pending: { label: "در انتظار بررسی", cls: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  approved: { label: "تایید شده", cls: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
  completed: { label: "تسویه شده", cls: "bg-success/10 text-success border-success/20", icon: Wallet },
  rejected: { label: "رد شده", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const fmtDate = (d?: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("fa-IR");
};
const money = (n: number) => {
  try { return formatPrice(n); } catch { return new Intl.NumberFormat("fa-IR").format(n); }
};

function normalize(r: any): ReturnRow {
  const items = Array.isArray(r.items) ? r.items : [];
  const st = String(r.status ?? "pending").toLowerCase() as RetStatus;
  return {
    id: String(r.id ?? r.returnId ?? ""),
    orderId: String(r.orderId ?? r.originalOrder ?? ""),
    customer: r.customer ?? r.customerName ?? "—",
    date: r.date ?? r.createdAt,
    itemsCount: items.length || Number(r.itemsCount ?? r.items ?? 0) || 0,
    totalRefund: Number(r.totalRefund ?? r.amount ?? 0),
    reason: r.reason ?? items[0]?.reason,
    status: statusMeta[st] ? st : "pending",
    items,
    refunds: Array.isArray(r.refunds) ? r.refunds : [],
    notes: r.notes,
  };
}

const reasonLabel = (r?: string) => (r ? (ReturnReasonLabels as any)[r] ?? r : "—");

export default function ReturnedOrders() {
  const navigate = useNavigate();
  const { data: allOrders = [] } = useQuery({ queryKey: ["orders"], queryFn: () => OrderService.list() });
  const returnsQ = useQuery({ queryKey: ["order-returns"], queryFn: () => OrderService.listReturns() });
  const rows = useMemo(() => (returnsQ.data ?? []).map(normalize), [returnsQ.data]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | RetStatus>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState<ReturnRow | null>(null);

  const filtered = rows.filter((r) => {
    const s = q.trim().toLowerCase();
    const m = !s || [r.id, r.orderId, r.customer].some((v) => v.toLowerCase().includes(s));
    return m && (status === "all" || r.status === status);
  });

  const count = (s: RetStatus) => rows.filter((r) => r.status === s).length;
  const refundTotal = rows.filter((r) => r.status !== "rejected").reduce((a, r) => a + r.totalRefund, 0);

  const reasons = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => { const k = reasonLabel(r.reason); map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const kpis = [
    { label: "کل مرجوعی‌ها", value: rows.length, icon: PackageOpen, tone: "text-foreground bg-muted" },
    { label: "در انتظار بررسی", value: count("pending"), icon: Clock, tone: "text-warning bg-warning/10" },
    { label: "تایید / تسویه", value: count("approved") + count("completed"), icon: CheckCircle2, tone: "text-success bg-success/10" },
    { label: "مبلغ بازپرداخت", value: money(refundTotal), icon: Wallet, tone: "text-primary bg-primary/10" },
  ];

  return (
    <div className="space-y-5 py-4 animate-fade-in" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <Undo2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مرجوعی‌ها</h1>
            <p className="text-xs text-muted-foreground">پیگیری کالاهای برگشتی، دلایل و بازپرداخت وجه</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
            <ArrowRight className="h-4 w-4 ml-1" /> سفارشات
          </Button>
          <Button variant="outline" size="sm" onClick={() => returnsQ.refetch()} disabled={returnsQ.isFetching}>
            <RefreshCw className={cn("h-4 w-4", returnsQ.isFetching && "animate-spin")} />
          </Button>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 ml-1" /> ثبت مرجوعی
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", k.tone)}>
              <k.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-base font-bold truncate">{returnsQ.isLoading ? <Skeleton className="h-5 w-12" /> : k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو: شناسه، سفارش، مشتری" className="pr-9 h-9" />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                {(Object.keys(statusMeta) as RetStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{statusMeta[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>مرجوعی</TableHead>
                <TableHead>مشتری</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>اقلام</TableHead>
                <TableHead>دلیل</TableHead>
                <TableHead>بازپرداخت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnsQ.isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))}
              {filtered.map((r) => {
                const m = statusMeta[r.status];
                return (
                  <TableRow key={r.id} className="text-sm cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell>
                      <div className="font-medium">{r.id}</div>
                      <div className="text-xs text-muted-foreground">سفارش {r.orderId}</div>
                    </TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(r.date)}</TableCell>
                    <TableCell>{r.itemsCount.toLocaleString("fa-IR")}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{reasonLabel(r.reason)}</Badge></TableCell>
                    <TableCell className="font-medium">{money(r.totalRefund)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1 font-normal", m.cls)}>
                        <m.icon className="h-3 w-3" /> {m.label}
                      </Badge>
                    </TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!returnsQ.isLoading && filtered.length === 0 && (
            <div className="py-12 text-center">
              <PackageOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm font-medium">{rows.length ? "موردی با این فیلتر یافت نشد" : "هنوز مرجوعی ثبت نشده است"}</div>
              {!rows.length && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 ml-1" /> ثبت اولین مرجوعی
                </Button>
              )}
            </div>
          )}
          <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
            نمایش {filtered.length.toLocaleString("fa-IR")} از {rows.length.toLocaleString("fa-IR")} مورد
          </div>
        </Card>

        <Card className="p-4 space-y-3 h-fit">
          <div className="text-sm font-semibold">دلایل مرجوعی</div>
          {reasons.length === 0 && <div className="text-xs text-muted-foreground">داده‌ای موجود نیست</div>}
          {reasons.map(([label, n]) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="text-muted-foreground">{n.toLocaleString("fa-IR")}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-destructive/70 rounded-full" style={{ width: `${(n / rows.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <SheetHeader className="text-right">
                <SheetTitle>مرجوعی {selected.id}</SheetTitle>
                <div className="text-xs text-muted-foreground">سفارش {selected.orderId} · {selected.customer} · {fmtDate(selected.date)}</div>
              </SheetHeader>
              <div className="mt-5 space-y-5">
                <Badge variant="outline" className={cn("gap-1", statusMeta[selected.status].cls)}>
                  {statusMeta[selected.status].label}
                </Badge>
                <div>
                  <div className="text-xs font-semibold mb-2 text-muted-foreground">اقلام برگشتی</div>
                  <div className="space-y-2">
                    {selected.items.length === 0 && <div className="text-xs text-muted-foreground">جزئیات اقلام موجود نیست</div>}
                    {selected.items.map((it, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{it.productName ?? `محصول ${it.productId}`}</span>
                          <span>{money(Number(it.unitPrice ?? 0) * Number(it.quantity ?? 0))}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Number(it.quantity ?? 0).toLocaleString("fa-IR")} × {money(Number(it.unitPrice ?? 0))} · {reasonLabel(it.reason)}
                        </div>
                        {it.note && <div className="text-xs mt-1">{it.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2 text-muted-foreground">بازپرداخت</div>
                  {selected.refunds.map((f, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{f.method}{f.gatewayTxnId ? ` · ${f.gatewayTxnId}` : ""}</span>
                      <span>{money(Number(f.amount ?? 0))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-border pt-2 mt-2">
                    <span>جمع</span><span>{money(selected.totalRefund)}</span>
                  </div>
                </div>
                {selected.notes && <div className="text-sm p-3 rounded-lg bg-muted">{selected.notes}</div>}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReturnOrderDialog
        open={showDialog}
        onOpenChange={(o) => { setShowDialog(o); if (!o) returnsQ.refetch(); }}
        orders={allOrders}
      />
    </div>
  );
}
