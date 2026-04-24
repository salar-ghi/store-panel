import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { FinanceService, formatCompact } from "@/services/finance-service";
import { BranchPerformance } from "@/types/finance";

export function BranchComparisonChart() {
  const [data, setData] = useState<BranchPerformance[]>([]);
  useEffect(() => {
    FinanceService.getBranchPerformance().then(setData);
  }, []);

  return (
    <Card className="p-5 border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">عملکرد شعبه‌ها</h3>
        <p className="text-xs text-muted-foreground">مقایسه درآمد و هزینه شعب</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="branchName" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCompact} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
              formatter={(v: number) => formatCompact(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} name="درآمد" />
            <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} name="هزینه" />
            <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="سود" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
