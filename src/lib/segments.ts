import { Order } from '@/types/order';
import { User } from '@/types/user';

export type SegmentKey =
  | 'vip'
  | 'loyal'
  | 'new'
  | 'at_risk'
  | 'churned'
  | 'prospect'
  | 'supplier';

export interface SegmentMeta {
  key: SegmentKey;
  label: string;
  description: string;
  /** Semantic token base used for badge / card accents. */
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';
}

export const SEGMENTS: SegmentMeta[] = [
  { key: 'vip', label: 'مشتریان ویژه (VIP)', description: '۵ سفارش یا بیشتر / خرید بالا', tone: 'primary' },
  { key: 'loyal', label: 'مشتریان وفادار', description: '۲ تا ۴ سفارش موفق', tone: 'success' },
  { key: 'new', label: 'مشتریان جدید', description: 'اولین خرید در ۳۰ روز اخیر', tone: 'info' },
  { key: 'at_risk', label: 'در معرض ریزش', description: 'بیش از ۶۰ روز بدون خرید', tone: 'warning' },
  { key: 'churned', label: 'ریزش‌کرده', description: 'بیش از ۱۲۰ روز بدون خرید', tone: 'destructive' },
  { key: 'prospect', label: 'بدون خرید', description: 'ثبت‌نام کرده اما سفارشی ندارد', tone: 'muted' },
  { key: 'supplier', label: 'تامین‌کنندگان', description: 'کاربران با نقش تامین‌کننده', tone: 'muted' },
];

export const SEGMENT_MAP = Object.fromEntries(SEGMENTS.map((s) => [s.key, s])) as Record<
  SegmentKey,
  SegmentMeta
>;

export interface CustomerStats {
  user: User;
  orderCount: number;
  totalSpend: number;
  avgOrderValue: number;
  lastOrderAt: Date | null;
  daysSinceLastOrder: number | null;
  returnedCount: number;
  openBasketCount: number;
  segment: SegmentKey;
}

const VIP_ORDER_COUNT = 5;
const VIP_SPEND = 50_000_000;

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function matchesUser(order: Order, user: User): boolean {
  if (order.customerId && order.customerId === user.id) return true;
  if (order.customerPhone && user.phoneNumber && order.customerPhone === user.phoneNumber) return true;
  const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return !!full && order.customer === full;
}

function isSupplier(user: User): boolean {
  return (user.roles || []).some((r) => /supplier|تامین/i.test(r));
}

export function buildCustomerStats(
  users: User[],
  orders: Order[],
  basketsByUser: Record<string, number> = {},
): CustomerStats[] {
  const now = Date.now();

  return users.map((user) => {
    const userOrders = orders.filter((o) => matchesUser(o, user));
    const paidOrders = userOrders.filter((o) => o.status !== 'rejected');
    const totalSpend = paidOrders.reduce((sum, o) => sum + (o.finalTotal ?? o.total ?? 0), 0);
    const dates = paidOrders.map((o) => parseDate(o.date)).filter(Boolean) as Date[];
    const lastOrderAt = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
    const daysSinceLastOrder = lastOrderAt
      ? Math.floor((now - lastOrderAt.getTime()) / 86_400_000)
      : null;
    const orderCount = paidOrders.length;

    let segment: SegmentKey;
    if (isSupplier(user)) segment = 'supplier';
    else if (orderCount === 0) segment = 'prospect';
    else if (orderCount >= VIP_ORDER_COUNT || totalSpend >= VIP_SPEND) segment = 'vip';
    else if (daysSinceLastOrder !== null && daysSinceLastOrder > 120) segment = 'churned';
    else if (daysSinceLastOrder !== null && daysSinceLastOrder > 60) segment = 'at_risk';
    else if (orderCount === 1 && (daysSinceLastOrder ?? 999) <= 30) segment = 'new';
    else segment = 'loyal';

    return {
      user,
      orderCount,
      totalSpend,
      avgOrderValue: orderCount ? Math.round(totalSpend / orderCount) : 0,
      lastOrderAt,
      daysSinceLastOrder,
      returnedCount: userOrders.filter((o) => o.status === 'rejected').length,
      openBasketCount: basketsByUser[user.id] ?? 0,
      segment,
    };
  });
}

export function segmentToneClasses(tone: SegmentMeta['tone']) {
  switch (tone) {
    case 'primary':
      return { badge: 'bg-primary/10 text-primary border-primary/20', ring: 'from-primary/20 to-primary/5', dot: 'bg-primary' };
    case 'success':
      return { badge: 'bg-success/10 text-success border-success/20', ring: 'from-success/20 to-success/5', dot: 'bg-success' };
    case 'warning':
      return { badge: 'bg-warning/10 text-warning border-warning/20', ring: 'from-warning/20 to-warning/5', dot: 'bg-warning' };
    case 'destructive':
      return { badge: 'bg-destructive/10 text-destructive border-destructive/20', ring: 'from-destructive/20 to-destructive/5', dot: 'bg-destructive' };
    case 'info':
      return { badge: 'bg-info/10 text-info border-info/20', ring: 'from-info/20 to-info/5', dot: 'bg-info' };
    default:
      return { badge: 'bg-muted text-muted-foreground border-border', ring: 'from-muted to-transparent', dot: 'bg-muted-foreground' };
  }
}
