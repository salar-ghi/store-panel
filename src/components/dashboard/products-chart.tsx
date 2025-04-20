
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "الکترونیک", value: 400 },
  { name: "پوشاک", value: 300 },
  { name: "خانه", value: 200 },
  { name: "زیبایی", value: 278 },
  { name: "ورزشی", value: 189 },
  { name: "کتاب", value: 239 },
];

export function ProductsChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass hover-lift">
        <CardHeader>
          <CardTitle className="text-gradient font-display">دسته‌بندی محصولات</CardTitle>
          <CardDescription className="font-vazirmatn">
            توزیع محصولات بر اساس دسته‌بندی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="font-vazirmatn"
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
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
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
