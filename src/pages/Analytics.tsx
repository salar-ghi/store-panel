
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const salesData = [
  { name: "فروردین", sales: 2400 },
  { name: "اردیبهشت", sales: 1398 },
  { name: "خرداد", sales: 9800 },
  { name: "تیر", sales: 3908 },
  { name: "مرداد", sales: 4800 },
  { name: "شهریور", sales: 3800 },
  { name: "مهر", sales: 4300 },
];

const trafficData = [
  { name: "مستقیم", value: 40 },
  { name: "ارگانیک", value: 30 },
  { name: "ارجاع", value: 20 },
  { name: "شبکه اجتماعی", value: 10 },
];

const conversionData = [
  { name: "شنبه", value: 2.4 },
  { name: "یکشنبه", value: 1.3 },
  { name: "دوشنبه", value: 3.2 },
  { name: "سه‌شنبه", value: 3.5 },
  { name: "چهارشنبه", value: 2.8 },
  { name: "پنج‌شنبه", value: 1.9 },
  { name: "جمعه", value: 1.5 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">تحلیل‌ها</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>نمای کلی فروش</CardTitle>
            <CardDescription>عملکرد فروش ماهانه</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
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
                  tickFormatter={(value) => `${value} تومان`}
                />
                <Tooltip formatter={(value) => [`${value} تومان`, 'فروش']} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="فروش"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>منابع ترافیک</CardTitle>
            <CardDescription>کانال‌های جذب مشتری</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}٪`
                  }
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>نرخ تبدیل</CardTitle>
            <CardDescription>نرخ تبدیل بازدیدکننده به مشتری روزانه</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
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
                  tickFormatter={(value) => `${value}٪`}
                />
                <Tooltip formatter={(value) => [`${value}٪`, 'نرخ تبدیل']} />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="نرخ تبدیل"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
