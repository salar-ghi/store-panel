import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface InventoryData {
  name: string;
  value: number;
  fill: string;
}

interface InventoryStatusChartProps {
  data: InventoryData[];
  title?: string;
  description?: string;
  className?: string;
}

export function InventoryStatusChart({
  data,
  title = "وضعیت موجودی",
  description = "نسبت موجودی محصولات",
  className,
}: InventoryStatusChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              data={data}
              startAngle={180}
              endAngle={0}
              barSize={15}
            >
              <RadialBar
                background
                dataKey="value"
                label={{ fill: 'hsl(var(--foreground))', position: 'insideStart' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, "درصد"]}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
