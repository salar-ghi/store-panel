import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Zap, FileText, Calendar, Building, Wifi, ShieldCheck, Receipt, CheckCircle2 } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, FinancialAccount, RecurringBill } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import { PriceInput } from "@/components/ui/price-input";

const icons = {
  utility: Zap,
  rent: Building,
  internet: Wifi,
  insurance: ShieldCheck,
  tax: Receipt,
  other: FileText,
};

const labels: Record<RecurringBill["category"], string> = {
  utility: "قبوض خدماتی",
  rent: "اجاره",
  internet: "اینترنت",
  insurance: "بیمه",
  tax: "مالیات",
  other: "متفرقه",
};

const cycleLabels: Record<RecurringBill["cycle"], string> = {
  weekly: "هفتگی",
  monthly: "ماهانه",
  quarterly: "فصلی",
  yearly: "سالانه",
};

export default function FinanceBills() {
  const { toast } = useToast();
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RecurringBill["category"]>("utility");
  const [amount, setAmount] = useState<string>("");
  const [branchId, setBranchId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [cycle, setCycle] = useState<RecurringBill["cycle"]>("monthly");
  const [vendor, setVendor] = useState("");
  const [autoPay, setAutoPay] = useState(true);

  const reload = () => {
    FinanceService.getBills().then(setBills);
    FinanceService.getBranches().then(setBranches);
    FinanceService.getAccounts().then(setAccounts);
  };

  useEffect(() => {
    reload();
  }, []);

  const totalMonthly = bills.reduce(
    (s, b) =>
      s +
      (b.cycle === "monthly"
        ? b.amount
        : b.cycle === "quarterly"
        ? b.amount / 3
        : b.cycle === "yearly"
        ? b.amount / 12
        : b.amount * 4),
    0
  );

  const handleCreateBill = async () => {
    if (!name.trim() || !amount || !branchId || !accountId) {
      toast({ title: "اطلاعات ناقص", description: "نام، مبلغ، شعبه و حساب الزامی است", variant: "destructive" });
      return;
    }
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);

    const newBill = await FinanceService.createBill({
      name,
      category,
      amount: Number(amount),
      currency: "IRR",
      branchId,
      accountId,
      cycle,
      nextDueDate: nextDate.toISOString(),
      autoPay,
      vendor,
      isActive: true,
    });
    setBills((prev) => [newBill, ...prev]);
    toast({ title: "قبض افزوده شد", description: `پرداخت دوره‌ای ${name} با موفقیت ثبت گردید.` });
    setDialogOpen(false);
    setName("");
    setAmount("");
    setVendor("");
  };

  const handleManualPay = async (bill: RecurringBill) => {
    try {
      await FinanceService.payBillManually(bill);
      toast({
        title: "پرداخت انجام شد",
        description: `مبلغ ${formatCurrency(bill.amount)} بابت «${bill.name}» ثبت سند و تسویه شد.`,
      });
      // Move nextDueDate forward by 30 days locally
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === bill.id) {
            const next = new Date(b.nextDueDate);
            next.setDate(next.getDate() + 30);
            return { ...b, nextDueDate: next.toISOString() };
          }
          return b;
        })
      );
    } catch {
      toast({ title: "خطا در پرداخت", description: "عملیات ثبت تسویه ناموفق بود", variant: "destructive" });
    }
  };

  const toggleAutoPay = (id: string, current: boolean) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, autoPay: !current } : b)));
    toast({
      title: "وضعیت پرداخت خودکار تغییر یافت",
      description: !current ? "پرداخت خودکار فعال شد" : "پرداخت خودکار غیرفعال شد",
    });
  };

  const filteredAccounts = accounts.filter((a) => !branchId || a.branchId === branchId);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">قبوض و پرداخت‌های دوره‌ای</h1>
          <p className="text-sm text-muted-foreground">مدیریت قبوض خودکار، اجاره، بیمه، مالیات و خدمات</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" /> افزودن قبض
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="text-sm text-muted-foreground">مجموع ماهیانه</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(Math.round(totalMonthly))}</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-success/10 to-transparent">
          <div className="text-sm text-muted-foreground">پرداخت خودکار فعال</div>
          <div className="text-2xl font-bold mt-1">{bills.filter((b) => b.autoPay).length} قبض</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-warning/10 to-transparent">
          <div className="text-sm text-muted-foreground">سررسید‌های نزدیک</div>
          <div className="text-2xl font-bold mt-1">
            {bills.filter((b) => new Date(b.nextDueDate).getTime() - Date.now() < 7 * 86400000).length} قبض
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((b) => {
          const Icon = icons[b.category] || FileText;
          const branch = branches.find((br) => br.id === b.branchId);
          const days = Math.ceil((new Date(b.nextDueDate).getTime() - Date.now()) / 86400000);
          const urgent = days <= 3;
          return (
            <Card key={b.id} className="p-5 border-0 hover-lift relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-1.5 h-full ${urgent ? "bg-destructive" : "bg-primary"}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {labels[b.category] || b.category} • {branch?.name || "شعبه مرکزی"}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {cycleLabels[b.cycle] || b.cycle}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          urgent
                            ? "bg-destructive/15 text-destructive border-destructive/20"
                            : "bg-info/15 text-info border-info/20"
                        }`}
                      >
                        <Calendar className="h-3 w-3 ml-1" /> {days > 0 ? `${days} روز دیگر` : "سررسید"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-lg font-bold">{formatCurrency(b.amount)}</div>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <span className="text-xs text-muted-foreground">پرداخت خودکار</span>
                    <Switch checked={b.autoPay} onCheckedChange={() => toggleAutoPay(b.id, b.autoPay)} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="default" className="flex-1" onClick={() => handleManualPay(b)}>
                  <CheckCircle2 className="h-4 w-4 ml-1" /> پرداخت دستی
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "اطلاعات قبض", description: `طرف حساب: ${b.vendor || "نامشخص"} | سررسید: ${new Date(b.nextDueDate).toLocaleDateString('fa-IR')}` })}>
                  جزئیات
                </Button>
              </div>
            </Card>
          );
        })}
        {bills.length === 0 && (
          <div className="md:col-span-2 text-center py-10 text-muted-foreground border border-dashed rounded-2xl">
            هیچ قبضی ثبت نشده است. از دکمه «افزودن قبض» استفاده کنید.
          </div>
        )}
      </div>

      {/* Add Bill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن قبض یا تعهد دوره‌ای جدید</DialogTitle>
            <DialogDescription>اطلاعات قبض آب، برق، اجاره، اینترنت یا مالیات را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>عنوان قبض *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً قبض برق انبار مرکزی" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>دسته‌بندی</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as RecurringBill["category"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">قبوض خدماتی</SelectItem>
                    <SelectItem value="rent">اجاره</SelectItem>
                    <SelectItem value="internet">اینترنت</SelectItem>
                    <SelectItem value="insurance">بیمه</SelectItem>
                    <SelectItem value="tax">مالیات</SelectItem>
                    <SelectItem value="other">متفرقه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>دوره تکرار</Label>
                <Select value={cycle} onValueChange={(v) => setCycle(v as RecurringBill["cycle"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">هفتگی</SelectItem>
                    <SelectItem value="monthly">ماهانه</SelectItem>
                    <SelectItem value="quarterly">فصلی</SelectItem>
                    <SelectItem value="yearly">سالانه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>مبلغ (ریال) *</Label>
              <PriceInput
                value={amount ? Number(amount) : undefined}
                onChange={(n) => setAmount(n ? String(n) : "")}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>شعبه مربوطه *</Label>
                <Select value={branchId} onValueChange={(v) => { setBranchId(v); setAccountId(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>حساب پرداخت‌کننده *</Label>
                <Select value={accountId} onValueChange={setAccountId} disabled={!branchId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={branchId ? "انتخاب حساب" : "ابتدا شعبه"} /></SelectTrigger>
                  <SelectContent>
                    {filteredAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>طرف حساب / شرکت ارائه‌دهنده</Label>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="شرکت توزیع نیروی برق" className="mt-1" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
              <div>
                <span className="text-sm font-medium">پرداخت خودکار در سررسید</span>
                <p className="text-xs text-muted-foreground">در تاریخ سررسید به‌صورت اتوماتیک تسویه شود</p>
              </div>
              <Switch checked={autoPay} onCheckedChange={setAutoPay} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleCreateBill}>ثبت قبض</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
