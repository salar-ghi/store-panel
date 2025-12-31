import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  className,
  variant = "default",
}: KPICardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", variantStyles[variant], className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {(change !== undefined || changeLabel) && (
                <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  <span>
                    {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
                    {changeLabel && ` ${changeLabel}`}
                  </span>
                </div>
              )}
            </div>
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
