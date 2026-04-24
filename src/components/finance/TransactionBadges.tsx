import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";

const labels: Record<Transaction["type"], string> = {
  sale: "فروش",
  purchase: "خرید",
  expense: "هزینه",
  salary: "حقوق",
  bill: "قبض",
  refund: "بازگشت وجه",
  transfer: "انتقال",
  income_other: "درآمد متفرقه",
  tax: "مالیات",
};

const colors: Record<Transaction["type"], string> = {
  sale: "bg-success/15 text-success border-success/20",
  refund: "bg-info/15 text-info border-info/20",
  income_other: "bg-success/15 text-success border-success/20",
  purchase: "bg-warning/15 text-warning border-warning/20",
  expense: "bg-destructive/15 text-destructive border-destructive/20",
  salary: "bg-primary/15 text-primary border-primary/20",
  bill: "bg-accent/15 text-accent border-accent/20",
  transfer: "bg-muted text-muted-foreground border-border",
  tax: "bg-destructive/15 text-destructive border-destructive/20",
};

export function TransactionTypeBadge({ type }: { type: Transaction["type"] }) {
  return <Badge variant="outline" className={cn("font-medium", colors[type])}>{labels[type]}</Badge>;
}

const statusLabels: Record<Transaction["status"], string> = {
  pending: "در انتظار تایید",
  approved: "تایید شده",
  completed: "تکمیل شده",
  rejected: "رد شده",
  scheduled: "زمان‌بندی شده",
};

const statusColors: Record<Transaction["status"], string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  approved: "bg-info/15 text-info border-info/20",
  completed: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
  scheduled: "bg-primary/15 text-primary border-primary/20",
};

export function TransactionStatusBadge({ status }: { status: Transaction["status"] }) {
  return <Badge variant="outline" className={cn("font-medium", statusColors[status])}>{statusLabels[status]}</Badge>;
}
