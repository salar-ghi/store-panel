import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, MapPin, User, Plus, Wallet, Banknote, CreditCard, Smartphone, PiggyBank } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, BranchPerformance, FinancialAccount, AccountType } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import { PriceInput } from "@/components/ui/price-input";

const branchTypeLabels: Record<Branch["type"], string> = {
  supermarket: "سوپرمارکت",
  chain_store: "فروشگاه زنجیره‌ای",
  online: "فروشگاه آنلاین",
  warehouse: "انبار",
};

const accountIcons = {
  cash: Banknote,
  bank: Building2,
  gateway: CreditCard,
  wallet: Smartphone,
  petty_cash: PiggyBank,
};

export default function FinanceBranches() {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [perf, setPerf] = useState<BranchPerformance[]>([]);

  // Branch Dialog
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchType, setBranchType] = useState<Branch["type"]>("supermarket");
  const [branchCity, setBranchCity] = useState("");
  const [branchManager, setBranchManager] = useState("");

  // Account Dialog
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accBranchId, setAccBranchId] = useState("");
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<AccountType>("bank");
  const [accBankName, setAccBankName] = useState("");
  const [accBalance, setAccBalance] = useState<string>("");

  const reload = () => {
    FinanceService.getBranches().then(setBranches);
    FinanceService.getAccounts().then(setAccounts);
    FinanceService.getBranchPerformance().then(setPerf);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreateBranch = async () => {
    if (!branchName.trim() || !branchCode.trim()) {
      toast({ title: "اطلاعات ناقص", description: "نام و کد شعبه الزامی است", variant: "destructive" });
      return;
    }
    const newBranch = await FinanceService.createBranch({
      name: branchName,
      code: branchCode,
      type: branchType,
      city: branchCity,
      manager: branchManager,
      isActive: true,
    });
    setBranches((prev) => [...prev, newBranch]);
    toast({ title: "شعبه اضافه شد", description: `شعبه ${branchName} با موفقیت ثبت شد.` });
    setBranchDialogOpen(false);
    setBranchName("");
    setBranchCode("");
    setBranchCity("");
    setBranchManager("");
  };

  const handleCreateAccount = async () => {
    if (!accName.trim() || !accBranchId) {
      toast({ title: "اطلاعات ناقص", description: "نام حساب و شعبه الزامی است", variant: "destructive" });
      return;
    }
    const newAcc = await FinanceService.createAccount({
      name: accName,
      type: accType,
      branchId: accBranchId,
      currency: "IRR",
      balance: Number(accBalance) || 0,
      bankName: accBankName,
      isActive: true,
    });
    setAccounts((prev) => [...prev, newAcc]);
    toast({ title: "حساب مالی ایجاد شد", description: `حساب ${accName} ثبت شد.` });
    setAccountDialogOpen(false);
    setAccName("");
    setAccBankName("");
    setAccBalance("");
  };

  const maxIncome = Math.max(1, ...perf.map((p) => p.income));

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">شعبه‌ها و حساب‌های مالی</h1>
          <p className="text-sm text-muted-foreground">مدیریت مالی هر شعبه به‌صورت مستقل و گزارش تجمیعی</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setAccountDialogOpen(true)}>
            <Wallet className="h-4 w-4 ml-2" /> افزودن حساب مالی
          </Button>
          <Button onClick={() => setBranchDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" /> افزودن شعبه
          </Button>
        </div>
      </div>

      {branches.length === 0 && (
        <Card className="p-10 text-center border-dashed">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="font-medium">هنوز شعبه‌ای ثبت نشده است</div>
          <p className="text-sm text-muted-foreground mt-1">از دکمه «افزودن شعبه» برای ایجاد اولین شعبه فروشگاه استفاده کنید.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => {
          const p = perf.find((x) => x.branchId === b.id);
          const branchAccounts = accounts.filter((a) => a.branchId === b.id);
          const totalBalance = branchAccounts.reduce((s, a) => s + a.balance, 0);
          const incomePct = p && maxIncome > 0 ? (p.income / maxIncome) * 100 : 0;
          return (
            <Card key={b.id} className="p-5 border-0 hover-lift relative overflow-hidden bg-gradient-to-br from-card to-muted/20">
              <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{b.name}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.city || "—"}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {b.manager || "—"}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{branchTypeLabels[b.type] ?? b.type ?? "شعبه"}</Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-success/10">
                    <div className="text-xs text-muted-foreground">درآمد</div>
                    <div className="font-bold text-success text-sm mt-1">{p ? formatCurrency(p.income) : "—"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <div className="text-xs text-muted-foreground">هزینه</div>
                    <div className="font-bold text-destructive text-sm mt-1">{p ? formatCurrency(p.expense) : "—"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <div className="text-xs text-muted-foreground">سود</div>
                    <div className="font-bold text-primary text-sm mt-1">{p ? formatCurrency(p.profit) : "—"}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">سهم از کل درآمد</span>
                    <span className="font-medium">{incomePct.toFixed(0)}%</span>
                  </div>
                  <Progress value={incomePct} className="h-2" />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium flex items-center gap-1"><Wallet className="h-3 w-3" /> حساب‌ها ({branchAccounts.length})</div>
                    <div className="text-sm font-bold">{formatCurrency(totalBalance)}</div>
                  </div>
                  <div className="space-y-1.5">
                    {branchAccounts.map((a) => {
                      const Icon = accountIcons[a.type as keyof typeof accountIcons] ?? Wallet;
                      return (
                        <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{a.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(a.balance)}</span>
                        </div>
                      );
                    })}
                    {branchAccounts.length === 0 && (
                      <div className="text-xs text-muted-foreground py-2 text-center">حسابی برای این شعبه ثبت نشده است</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Branch Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن شعبه جدید</DialogTitle>
            <DialogDescription>مشخصات شعبه یا فروشگاه جدید را وارد نمایید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>نام شعبه *</Label>
              <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="مثلاً شعبه نیاوران" className="mt-1" />
            </div>
            <div>
              <Label>کد شعبه *</Label>
              <Input value={branchCode} onChange={(e) => setBranchCode(e.target.value)} placeholder="مثلاً BR-102" className="mt-1" />
            </div>
            <div>
              <Label>نوع شعبه</Label>
              <Select value={branchType} onValueChange={(v) => setBranchType(v as Branch["type"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supermarket">سوپرمارکت</SelectItem>
                  <SelectItem value="chain_store">فروشگاه زنجیره‌ای</SelectItem>
                  <SelectItem value="online">فروشگاه آنلاین</SelectItem>
                  <SelectItem value="warehouse">انبار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>شهر</Label>
                <Input value={branchCity} onChange={(e) => setBranchCity(e.target.value)} placeholder="تهران" className="mt-1" />
              </div>
              <div>
                <Label>مدیر شعبه</Label>
                <Input value={branchManager} onChange={(e) => setBranchManager(e.target.value)} placeholder="نام مسئول" className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleCreateBranch}>ثبت شعبه</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن حساب مالی</DialogTitle>
            <DialogDescription>حساب بانکی، صندوق نقدی یا کیف پول برای یک شعبه تعریف کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>شعبه مربوطه *</Label>
              <Select value={accBranchId} onValueChange={setAccBranchId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نام حساب *</Label>
              <Input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="مثلاً بانک ملت - حساب اصلی" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع حساب</Label>
                <Select value={accType} onValueChange={(v) => setAccType(v as AccountType)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">بانکی</SelectItem>
                    <SelectItem value="cash">صندوق نقد</SelectItem>
                    <SelectItem value="gateway">درگاه پرداخت</SelectItem>
                    <SelectItem value="wallet">کیف پول</SelectItem>
                    <SelectItem value="petty_cash">تنخواه‌گردان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نام بانک / مؤسسه</Label>
                <Input value={accBankName} onChange={(e) => setAccBankName(e.target.value)} placeholder="بانک سامان" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>موجودی اولیه (ریال)</Label>
              <PriceInput
                value={accBalance ? Number(accBalance) : undefined}
                onChange={(n) => setAccBalance(n ? String(n) : "")}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleCreateAccount}>ثبت حساب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
