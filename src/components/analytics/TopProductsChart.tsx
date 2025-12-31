import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface ProductData {
  name: string;
  sales: number;
  quantity: number;
}

interface TopProductsChartProps {
  data: ProductData[];
  title?: string;
  description?: string;
  className?: string;
}

export function TopProductsChart({
  data,
  title = "پرفروش‌ترین محصولات",
  description = "۱۰ محصول با بیشترین فروش",
  className,
}: TopProductsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  name === "sales"
                    ? `${value.toLocaleString("fa-IR")} تومان`
                    : value.toLocaleString("fa-IR"),
                  name === "sales" ? "فروش" : "تعداد",
                ]}
              />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]} name="sales">
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(var(--primary) / ${1 - index * 0.08})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
