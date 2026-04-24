import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCheck, Play, Plus, Users } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, PayrollEntry } from "@/types/finance";

const statusLabels: Record<PayrollEntry["status"], string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  scheduled: "زمان‌بندی شده",
};

const statusColors: Record<PayrollEntry["status"], string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  paid: "bg-success/15 text-success border-success/20",
  scheduled: "bg-info/15 text-info border-info/20",
};

export default function FinancePayroll() {
  const [list, setList] = useState<PayrollEntry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    FinanceService.getPayroll().then(setList);
    FinanceService.getBranches().then(setBranches);
  }, []);

  const total = list.reduce((s, p) => s + p.netPay, 0);
  const paid = list.filter((p) => p.status === "paid").reduce((s, p) => s + p.netPay, 0);
  const pending = list.filter((p) => p.status !== "paid").reduce((s, p) => s + p.netPay, 0);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حقوق و دستمزد</h1>
          <p className="text-sm text-muted-foreground">مدیریت پرداخت حقوق پرسنل به تفکیک شعبه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Plus className="h-4 w-4 ml-2" /> افزودن پرسنل</Button>
          <Button><Play className="h-4 w-4 ml-2" /> اجرای دوره</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="text-sm text-muted-foreground">مجموع حقوق دوره</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(total)}</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-success/10 to-transparent">
          <div className="text-sm text-muted-foreground">پرداخت شده</div>
          <div className="text-2xl font-bold mt-1 text-success">{formatCurrency(paid)}</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-warning/10 to-transparent">
          <div className="text-sm text-muted-foreground">باقی‌مانده</div>
          <div className="text-2xl font-bold mt-1 text-warning">{formatCurrency(pending)}</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-accent/10 to-transparent">
          <div className="text-sm text-muted-foreground">تعداد پرسنل</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2"><Users className="h-5 w-5" /> {list.length}</div>
        </Card>
      </div>

      <Card className="border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>پرسنل</TableHead>
                <TableHead>شعبه</TableHead>
                <TableHead>حقوق پایه</TableHead>
                <TableHead>پاداش</TableHead>
                <TableHead>کسورات</TableHead>
                <TableHead>خالص پرداختی</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => {
                const branch = branches.find((b) => b.id === p.branchId);
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/15 text-primary text-xs">{p.employeeName.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <div className="text-sm font-medium">{p.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{p.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch?.name}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(p.baseSalary)}</TableCell>
                    <TableCell className="text-sm text-success">+{formatCurrency(p.bonus ?? 0)}</TableCell>
                    <TableCell className="text-sm text-destructive">-{formatCurrency(p.deductions ?? 0)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(p.netPay)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[p.status]}>{statusLabels[p.status]}</Badge></TableCell>
                    <TableCell className="text-left">
                      {p.status !== "paid" && (
                        <Button size="sm" variant="ghost" className="text-success"><CheckCheck className="h-4 w-4 ml-1" /> پرداخت</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
