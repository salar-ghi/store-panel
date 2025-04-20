
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "فروردین", sales: 2400 },
  { name: "اردیبهشت", sales: 1398 },
  { name: "خرداد", sales: 9800 },
  { name: "تیر", sales: 3908 },
  { name: "مرداد", sales: 4800 },
  { name: "شهریور", sales: 3800 },
  { name: "مهر", sales: 4300 },
];

export function SalesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass hover-lift">
        <CardHeader>
          <CardTitle className="text-gradient font-display">نمای کلی فروش</CardTitle>
          <CardDescription className="font-vazirmatn">
            عملکرد فروش ماهانه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()} تومان`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  fontFamily: "Vazirmatn"
                }}
                labelStyle={{ fontFamily: "Vazirmatn" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
                activeDot={{ 
                  r: 8,
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  stroke: "#fff"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
