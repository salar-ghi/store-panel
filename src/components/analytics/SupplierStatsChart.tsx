import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SupplierData {
  id: string;
  name: string;
  totalProducts: number;
  totalSales: number;
  ordersFulfilled: number;
  performance: number;
  trend: "up" | "down" | "neutral";
}

interface SupplierStatsChartProps {
  data: SupplierData[];
  title?: string;
  description?: string;
  className?: string;
}

export function SupplierStatsChart({
  data,
  title = "آمار تأمین‌کنندگان",
  description = "عملکرد و وضعیت تأمین‌کنندگان",
  className,
}: SupplierStatsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">تأمین‌کننده</TableHead>
                <TableHead className="text-center">محصولات</TableHead>
                <TableHead className="text-center">فروش</TableHead>
                <TableHead className="text-center">عملکرد</TableHead>
                <TableHead className="text-center">روند</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{supplier.totalProducts}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {(supplier.totalSales / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={supplier.performance} className="h-2 w-16" />
                      <span className="text-xs text-muted-foreground">
                        {supplier.performance}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {supplier.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-success inline" />
                    ) : supplier.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-destructive inline" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
