import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number; // percent
  hint?: string;
  gradient?: string; // tailwind gradient classes
  accent?: string; // text color class for icon bg
}

export function FinanceStatCard({ title, value, icon, trend, hint, gradient = "from-primary/15 via-primary/5 to-transparent", accent = "bg-primary/15 text-primary" }: Props) {
  const positive = (trend ?? 0) >= 0;
  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-sm hover-lift bg-gradient-to-br", gradient)}>
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm", accent)}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1", positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </Card>
  );
}
