import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck, Play, Plus, Users, Landmark } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, FinancialAccount, PayrollEntry } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import { PriceInput } from "@/components/ui/price-input";

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
  const { toast } = useToast();
  const [list, setList] = useState<PayrollEntry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);

  // Dialogs
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [runPeriodDialogOpen, setRunPeriodDialogOpen] = useState(false);

  // New staff form
  const [empName, setEmpName] = useState("");
  const [position, setPosition] = useState("");
  const [branchId, setBranchId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");
  const [period, setPeriod] = useState("1404-01");

  // Run period form
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [running, setRunning] = useState(false);

  const reload = () => {
    FinanceService.getPayroll().then(setList);
    FinanceService.getBranches().then(setBranches);
    FinanceService.getAccounts().then(setAccounts);
  };

  useEffect(() => {
    reload();
  }, []);

  const total = list.reduce((s, p) => s + p.netPay, 0);
  const paid = list.filter((p) => p.status === "paid").reduce((s, p) => s + p.netPay, 0);
  const pending = list.filter((p) => p.status !== "paid").reduce((s, p) => s + p.netPay, 0);

  const handleCreateStaff = async () => {
    if (!empName.trim() || !baseSalary || !branchId) {
      toast({ title: "اطلاعات ناقص", description: "نام، حقوق پایه و شعبه الزامی است", variant: "destructive" });
      return;
    }
    const b = Number(baseSalary) || 0;
    const bo = Number(bonus) || 0;
    const de = Number(deductions) || 0;
    const net = b + bo - de;

    const newLine = await FinanceService.createPayrollLine({
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeName: empName,
      position,
      branchId,
      baseSalary: b,
      bonus: bo,
      deductions: de,
      netPay: net,
      currency: "IRR",
      period,
      status: "pending",
    });

    setList((prev) => [newLine, ...prev]);
    toast({ title: "پرسنل افزوده شد", description: `رکورد حقوق برای ${empName} ثبت شد.` });
    setStaffDialogOpen(false);
    setEmpName("");
    setPosition("");
    setBaseSalary("");
    setBonus("");
    setDeductions("");
  };

  const handlePayIndividual = async (p: PayrollEntry) => {
    const acc = accounts.find((a) => a.branchId === p.branchId) || accounts[0];
    if (!acc) {
      toast({ title: "خطا", description: "ابتدا یک حساب مالی فعال ثبت کنید", variant: "destructive" });
      return;
    }
    try {
      await FinanceService.payPayrollLine(p, acc.id);
      setList((prev) => prev.map((item) => (item.id === p.id ? { ...item, status: "paid" } : item)));
      toast({
        title: "حقوق پرداخت شد",
        description: `مبلغ ${formatCurrency(p.netPay)} به ${p.employeeName} واریز و سند هزینه ثبت شد.`,
      });
    } catch {
      toast({ title: "خطا در پرداخت", description: "عملیات ناموفق بود", variant: "destructive" });
    }
  };

  const handleRunPeriod = async () => {
    if (!paymentAccountId) {
      toast({ title: "حساب واریز را انتخاب کنید", variant: "destructive" });
      return;
    }
    setRunning(true);
    try {
      const pendingItems = list.filter((p) => p.status !== "paid");
      for (const p of pendingItems) {
        await FinanceService.payPayrollLine(p, paymentAccountId);
      }
      setList((prev) => prev.map((p) => ({ ...p, status: "paid" })));
      toast({
        title: "دوره حقوق با موفقیت اجرا شد",
        description: `حقوق ${pendingItems.length} نفر پرداخت و اسناد مالی ثبت شد.`,
      });
      setRunPeriodDialogOpen(false);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">حقوق و دستمزد</h1>
          <p className="text-sm text-muted-foreground">مدیریت پرداخت حقوق پرسنل به تفکیک شعبه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStaffDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" /> افزودن پرسنل
          </Button>
          <Button onClick={() => setRunPeriodDialogOpen(true)}>
            <Play className="h-4 w-4 ml-2" /> اجرای دوره
          </Button>
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
          <div className="text-2xl font-bold mt-1 flex items-center gap-2">
            <Users className="h-5 w-5" /> {list.length}
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
              {list.map((p) => {
                const branch = branches.find((b) => b.id === p.branchId);
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/15 text-primary text-xs">
                            {p.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{p.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{p.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch?.name || "مرکزی"}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(p.baseSalary)}</TableCell>
                    <TableCell className="text-sm text-success">+{formatCurrency(p.bonus ?? 0)}</TableCell>
                    <TableCell className="text-sm text-destructive">-{formatCurrency(p.deductions ?? 0)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(p.netPay)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[p.status]}>
                        {statusLabels[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      {p.status !== "paid" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:bg-success/10"
                          onClick={() => handlePayIndividual(p)}
                        >
                          <CheckCheck className="h-4 w-4 ml-1" /> پرداخت
                        </Button>
                      ) : (
                        <span className="text-xs text-success flex items-center gap-1 justify-end">
                          <CheckCheck className="h-3 w-3" /> تسویه شده
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    لیست حقوق خالی است. با استفاده از دکمه «افزودن پرسنل» اطلاعات را ثبت نمایید.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Staff Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن پرسنل به دوره حقوق</DialogTitle>
            <DialogDescription>مشخصات حقوق، پاداش و کسورات کارمند را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>نام و نام خانوادگی *</Label>
              <Input value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="مثلاً علی رضایی" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>سمت / موقعیت شغلی</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="حسابدار / انباردار" className="mt-1" />
              </div>
              <div>
                <Label>دوره حقوق</Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="1404-01" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>شعبه مربوطه *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>حقوق پایه (ریال) *</Label>
              <PriceInput
                value={baseSalary ? Number(baseSalary) : undefined}
                onChange={(n) => setBaseSalary(n ? String(n) : "")}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>پاداش و مزایا (ریال)</Label>
                <PriceInput
                  value={bonus ? Number(bonus) : undefined}
                  onChange={(n) => setBonus(n ? String(n) : "")}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>کسورات و جریمه (ریال)</Label>
                <PriceInput
                  value={deductions ? Number(deductions) : undefined}
                  onChange={(n) => setDeductions(n ? String(n) : "")}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleCreateStaff}>ثبت پرسنل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Period Dialog */}
      <Dialog open={runPeriodDialogOpen} onOpenChange={setRunPeriodDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>اجرای دوره و تسویه گروهی حقوق</DialogTitle>
            <DialogDescription>
              تسویه حقوق تمام پرسنل در وضعیت «در انتظار» به مبلغ کل {formatCurrency(pending)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>حساب مبدأ پرداخت حقوق *</Label>
              <Select value={paymentAccountId} onValueChange={setPaymentAccountId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب حساب بانکی" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-info/10 text-info text-xs flex items-center gap-2">
              <Landmark className="h-4 w-4 shrink-0" />
              پس از تایید، به ازای هر پرسنل یک سند پرداخت هزینه حقوق به طور رسمی ثبت می‌شود.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRunPeriodDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleRunPeriod} disabled={running || pending === 0}>
              {running ? "در حال تسویه..." : "تایید و واریز گروهی"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
