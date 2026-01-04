import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, TrendingDown } from "lucide-react";

interface TargetData {
  name: string;
  current: number;
  target: number;
  unit: string;
}

interface MonthlyTargetChartProps {
  data: TargetData[];
  className?: string;
}

export function MonthlyTargetChart({ data, className }: MonthlyTargetChartProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          اهداف ماهانه
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((item, index) => {
          const percentage = Math.min((item.current / item.target) * 100, 100);
          const isAchieved = item.current >= item.target;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  {isAchieved ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {item.current.toLocaleString('fa-IR')} / {item.target.toLocaleString('fa-IR')} {item.unit}
                  </span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "h-2",
                  isAchieved ? "[&>div]:bg-success" : "[&>div]:bg-primary"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% تکمیل شده</span>
                <span className={isAchieved ? "text-success" : "text-warning"}>
                  {isAchieved ? "هدف محقق شد" : `${(item.target - item.current).toLocaleString('fa-IR')} ${item.unit} مانده`}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
