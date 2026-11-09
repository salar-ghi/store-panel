import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCheck, Play, Plus, Users } from "lucide-react";
import { formatCurrency } from "@/services/finance-service";
import { PayrollEntry } from "@/types/finance";
import { useFinanceBranches, useFinancePayroll } from "@/hooks/use-finance";
import { PayrollEntryDialog } from "@/components/finance/PayrollEntryDialog";
import { PayrollCycleDialog } from "@/components/finance/PayrollCycleDialog";
import { SinglePayrollPayDialog } from "@/components/finance/SinglePayrollPayDialog";

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
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [payingEntry, setPayingEntry] = useState<PayrollEntry | null>(null);

  const { data: list = [], isLoading: isPayrollLoading } = useFinancePayroll();
  const { data: branches = [] } = useFinanceBranches();

  const total = list.reduce((s, p) => s + p.netPay, 0);
  const paid = list.filter((p) => p.status === "paid").reduce((s, p) => s + p.netPay, 0);
  const pendingEntries = list.filter((p) => p.status !== "paid");
  const pending = pendingEntries.reduce((s, p) => s + p.netPay, 0);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">حقوق و دستمزد</h1>
          <p className="text-sm text-muted-foreground">مدیریت پرداخت حقوق پرسنل به تفکیک شعبه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEntryModalOpen(true)}>
            <Plus className="h-4 w-4 ml-2" /> افزودن پرسنل
          </Button>
          <Button onClick={() => setCycleModalOpen(true)}>
            <Play className="h-4 w-4 ml-2" /> اجرای دوره
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="text-sm text-muted-foreground">مجموع حقوق دوره</div>
          <div className="text-2xl font-bold mt-1">
            {isPayrollLoading ? "—" : formatCurrency(total)}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-success/10 to-transparent">
          <div className="text-sm text-muted-foreground">پرداخت شده</div>
          <div className="text-2xl font-bold mt-1 text-success">
            {isPayrollLoading ? "—" : formatCurrency(paid)}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-warning/10 to-transparent">
          <div className="text-sm text-muted-foreground">باقی‌مانده</div>
          <div className="text-2xl font-bold mt-1 text-warning">
            {isPayrollLoading ? "—" : formatCurrency(pending)}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-accent/10 to-transparent">
          <div className="text-sm text-muted-foreground">تعداد پرسنل</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2">
            <Users className="h-5 w-5" /> {isPayrollLoading ? "—" : list.length}
          </div>
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
              {isPayrollLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="p-4">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    اطلاعات حقوق و دستمزدی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => {
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-success hover:bg-success/10"
                            onClick={() => setPayingEntry(p)}
                          >
                            <CheckCheck className="h-4 w-4 ml-1" /> پرداخت
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <PayrollEntryDialog open={entryModalOpen} onOpenChange={setEntryModalOpen} />
      <PayrollCycleDialog
        open={cycleModalOpen}
        onOpenChange={setCycleModalOpen}
        pendingTotal={pending}
        pendingCount={pendingEntries.length}
      />
      <SinglePayrollPayDialog
        open={!!payingEntry}
        onOpenChange={(o) => { if (!o) setPayingEntry(null); }}
        entry={payingEntry}
      />
    </div>
  );
}
