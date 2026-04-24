import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FinanceService, formatCompact } from "@/services/finance-service";
import { CashFlowPoint } from "@/types/finance";

export function CashFlowChart() {
  const [data, setData] = useState<CashFlowPoint[]>([]);
  useEffect(() => {
    FinanceService.getCashFlow().then(setData);
  }, []);

  return (
    <Card className="p-5 border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">جریان نقدی</h3>
          <p className="text-xs text-muted-foreground">درآمد و هزینه ۱۴ روز اخیر</p>
        </div>
        <Tabs defaultValue="14d">
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs h-6">۷ روز</TabsTrigger>
            <TabsTrigger value="14d" className="text-xs h-6">۱۴ روز</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs h-6">۳۰ روز</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.45} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCompact} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
              formatter={(v: number) => formatCompact(v)}
            />
            <Area type="monotone" dataKey="income" stroke="hsl(var(--success))" fill="url(#incFill)" strokeWidth={2} name="درآمد" />
            <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" fill="url(#expFill)" strokeWidth={2} name="هزینه" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
