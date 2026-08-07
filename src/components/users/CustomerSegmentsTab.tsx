import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Users2, TrendingUp, ShoppingBag, Crown } from "lucide-react";
import { UserService } from "@/services/user-service";
import { OrderService } from "@/services/order-service";
import { BasketService } from "@/services/basket-service";
import { buildCustomerStats, SEGMENTS, SEGMENT_MAP, SegmentKey, segmentToneClasses } from "@/lib/segments";
import { formatPrice, formatPersianNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  onUserClick: (userId: string) => void;
}

export function CustomerSegmentsTab({ onUserClick }: Props) {
  const [active, setActive] = useState<SegmentKey | "all">("all");
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: UserService.getAllUsers });
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: () => OrderService.list() });
  const { data: baskets = [] } = useQuery({
    queryKey: ["baskets"],
    queryFn: () => BasketService.list(),
    retry: false,
  });

  const basketsByUser = useMemo(() => {
    const map: Record<string, number> = {};
    baskets.forEach((b) => {
      if (b.userId && b.status === "active") map[b.userId] = (map[b.userId] ?? 0) + 1;
    });
    return map;
  }, [baskets]);

  const stats = useMemo(
    () => buildCustomerStats(users, orders, basketsByUser),
    [users, orders, basketsByUser],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    stats.forEach((s) => (c[s.segment] = (c[s.segment] ?? 0) + 1));
    return c;
  }, [stats]);

  const revenueBySegment = useMemo(() => {
    const c: Record<string, number> = {};
    stats.forEach((s) => (c[s.segment] = (c[s.segment] ?? 0) + s.totalSpend));
    return c;
  }, [stats]);

  const filtered = stats.filter((s) => {
    if (active !== "all" && s.segment !== active) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(q) ||
      (s.user.phoneNumber ?? "").includes(q) ||
      (s.user.email ?? "").toLowerCase().includes(q)
    );
  });

  const totalRevenue = stats.reduce((a, s) => a + s.totalSpend, 0);
  const buyers = stats.filter((s) => s.orderCount > 0).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "کل کاربران", value: formatPersianNumber(stats.length), icon: Users2 },
          { label: "کاربران خریدار", value: formatPersianNumber(buyers), icon: ShoppingBag },
          { label: "نرخ تبدیل", value: `${formatPersianNumber(stats.length ? Math.round((buyers / stats.length) * 100) : 0)}٪`, icon: TrendingUp },
          { label: "درآمد کل", value: formatPrice(totalRevenue), icon: Crown },
        ].map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/5" />
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
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

      {/* Segment cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-xl border p-4 text-right transition-all hover:shadow-md",
            active === "all" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
          )}
        >
          <p className="text-sm font-medium">همه کاربران</p>
          <p className="mt-1 text-2xl font-bold">{formatPersianNumber(stats.length)}</p>
          <p className="mt-1 text-xs text-muted-foreground">نمایش کل فهرست</p>
        </button>

        {SEGMENTS.map((seg) => {
          const tone = segmentToneClasses(seg.tone);
          const isActive = active === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => setActive(seg.key)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 text-right transition-all hover:shadow-md",
                isActive ? "border-primary shadow-sm" : "border-border",
                "bg-gradient-to-bl",
                tone.ring,
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
                  {seg.label}
                </span>
                <Badge variant="outline" className={tone.badge}>
                  {formatPersianNumber(counts[seg.key] ?? 0)}
                </Badge>
              </div>
              <p className="mt-2 text-lg font-bold">{formatPrice(revenueBySegment[seg.key] ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{seg.description}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">
            {active === "all" ? "همه کاربران" : SEGMENT_MAP[active].label}
            <span className="mr-2 text-sm font-normal text-muted-foreground">
              ({formatPersianNumber(filtered.length)} کاربر)
            </span>
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی نام یا موبایل..."
              className="pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>سگمنت</TableHead>
                <TableHead>تعداد سفارش</TableHead>
                <TableHead>مجموع خرید</TableHead>
                <TableHead>میانگین سبد</TableHead>
                <TableHead>آخرین خرید</TableHead>
                <TableHead>سبد باز</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    کاربری در این سگمنت یافت نشد
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((s) => {
                const meta = SEGMENT_MAP[s.segment];
                const tone = segmentToneClasses(meta.tone);
                return (
                  <TableRow key={s.user.id} className="cursor-pointer" onClick={() => onUserClick(s.user.id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold">
                          {(s.user.firstName?.[0] ?? "?") + (s.user.lastName?.[0] ?? "")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {s.user.firstName} {s.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.user.phoneNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tone.badge}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPersianNumber(s.orderCount)}</TableCell>
                    <TableCell className="font-medium">{formatPrice(s.totalSpend)}</TableCell>
                    <TableCell>{formatPrice(s.avgOrderValue)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.daysSinceLastOrder === null
                        ? "—"
                        : `${formatPersianNumber(s.daysSinceLastOrder)} روز پیش`}
                    </TableCell>
                    <TableCell>
                      {s.openBasketCount ? (
                        <Badge variant="secondary">{formatPersianNumber(s.openBasketCount)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onUserClick(s.user.id); }}>
                        جزئیات
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
