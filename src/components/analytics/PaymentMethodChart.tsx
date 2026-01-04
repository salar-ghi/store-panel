import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface PaymentMethodData {
  name: string;
  value: number;
  fill: string;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
  className?: string;
}

export function PaymentMethodChart({ data, className }: PaymentMethodChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill,
  }));

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">روش‌های پرداخت</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={18}
              data={chartData}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
                formatter={(value: number) => [`${value}%`, 'درصد']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 flex-wrap">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
