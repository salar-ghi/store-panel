import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatmapData {
  day: string;
  hours: number[];
}

interface OrdersHeatmapProps {
  data: HeatmapData[];
  title?: string;
  description?: string;
  className?: string;
}

const hours = ["۰۰", "۰۳", "۰۶", "۰۹", "۱۲", "۱۵", "۱۸", "۲۱"];

export function OrdersHeatmap({
  data,
  title = "نقشه حرارتی سفارشات",
  description = "زمان‌های پرتراکم سفارش‌دهی",
  className,
}: OrdersHeatmapProps) {
  const maxValue = Math.max(...data.flatMap((d) => d.hours));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity < 0.2) return "bg-primary/10";
    if (intensity < 0.4) return "bg-primary/25";
    if (intensity < 0.6) return "bg-primary/45";
    if (intensity < 0.8) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-1 pr-12">
              {hours.map((hour) => (
                <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                  {hour}
                </div>
              ))}
            </div>
            {data.map((row, rowIndex) => (
              <div key={row.day} className="flex items-center gap-1">
                <div className="w-12 text-xs text-muted-foreground text-right">
                  {row.day}
                </div>
                {row.hours.map((value, colIndex) => (
                  <motion.div
                    key={colIndex}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (rowIndex * 8 + colIndex) * 0.01 }}
                    className={cn(
                      "flex-1 h-6 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50",
                      getColor(value)
                    )}
                    title={`${row.day} - ${hours[colIndex]}:00 - ${value} سفارش`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>کم</span>
            <div className="flex gap-1">
              {["bg-primary/10", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"].map(
                (bg) => (
                  <div key={bg} className={cn("w-4 h-4 rounded-sm", bg)} />
                )
              )}
            </div>
            <span>زیاد</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
