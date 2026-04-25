import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FinanceService } from "@/services/finance-service";
import { Branch, FinancialAccount, Transaction, TransactionType, PaymentMethod, TransactionStatus } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownCircle, ArrowUpCircle, Banknote, Receipt, RotateCcw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Transaction | null;
  onSaved?: (tx: Transaction) => void;
}

const typeOptions: { value: TransactionType; label: string; icon: any; tone: string; flow: "in" | "out" }[] = [
  { value: "sale", label: "فروش / درآمد", icon: ArrowDownCircle, tone: "text-success", flow: "in" },
  { value: "income_other", label: "درآمد متفرقه", icon: Wallet, tone: "text-success", flow: "in" },
  { value: "refund", label: "بازگشت وجه", icon: RotateCcw, tone: "text-info", flow: "in" },
  { value: "purchase", label: "خرید کالا", icon: ArrowUpCircle, tone: "text-warning", flow: "out" },
  { value: "expense", label: "هزینه عملیاتی", icon: Receipt, tone: "text-destructive", flow: "out" },
  { value: "salary", label: "پرداخت حقوق", icon: Banknote, tone: "text-primary", flow: "out" },
  { value: "bill", label: "پرداخت قبض", icon: Receipt, tone: "text-accent", flow: "out" },
  { value: "tax", label: "مالیات", icon: Receipt, tone: "text-destructive", flow: "out" },
];

const methodLabels: Record<PaymentMethod, string> = {
  cash: "نقدی",
  card: "کارت بانکی",
  bank_transfer: "انتقال بانکی",
  online_gateway: "درگاه آنلاین",
  cheque: "چک",
  wallet: "کیف پول",
};

export function TransactionFormDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<TransactionType>("sale");
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [branchId, setBranchId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [counterparty, setCounterparty] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [autoPost, setAutoPost] = useState(true);

  useEffect(() => {
    FinanceService.getBranches().then(setBranches);
    FinanceService.getAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    if (initial) {
      setType(initial.type);
      setAmount(String(initial.amount));
      setMethod(initial.method);
      setBranchId(initial.branchId);
      setAccountId(initial.accountId);
      setCounterparty(initial.counterparty ?? "");
      setCategory(initial.category ?? "");
      setReference(initial.reference ?? "");
      setDescription(initial.description ?? "");
      setAutoPost(initial.status === "completed");
    } else {
      setType("sale"); setAmount(""); setMethod("cash");
      setBranchId(""); setAccountId(""); setCounterparty("");
      setCategory(""); setReference(""); setDescription(""); setAutoPost(true);
    }
  }, [initial, open]);

  const filteredAccounts = accounts.filter((a) => !branchId || a.branchId === branchId);
  const selectedTypeMeta = typeOptions.find((t) => t.value === type)!;

  const handleSubmit = async () => {
    if (!amount || !branchId || !accountId) {
      toast({ title: "اطلاعات ناقص", description: "مبلغ، شعبه و حساب الزامی است", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const status: TransactionStatus = autoPost ? "completed" : "pending";
      const payload = {
        type, amount: Number(amount), method, branchId, accountId,
        counterparty, category, reference, description,
        currency: "IRR" as const,
        status,
        date: new Date().toISOString(),
        createdBy: "کاربر فعلی",
      };
      let saved: Transaction | null;
      if (initial) {
        saved = await FinanceService.updateTransaction(initial.id, payload);
      } else {
        saved = await FinanceService.createTransaction(payload);
      }
      if (saved) {
        toast({ title: initial ? "تراکنش بروزرسانی شد" : "تراکنش ثبت شد", description: autoPost ? "به‌صورت خودکار ثبت نهایی شد" : "به صف تایید ارسال شد" });
        onSaved?.(saved);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">{initial ? "ویرایش تراکنش مالی" : "ثبت تراکنش مالی جدید"}</DialogTitle>
          <DialogDescription>درآمد، خرید، هزینه، حقوق یا قبض را با جزئیات کامل ثبت کنید.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="mb-2 block">نوع تراکنش</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {typeOptions.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-lg border text-right transition-all",
                      active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 bg-card"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", t.tone)} />
                    <span className="text-xs font-medium">{t.label}</span>
                    <span className="text-[10px] text-muted-foreground">{t.flow === "in" ? "ورودی" : "خروجی"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">مبلغ (ریال) *</Label>
              <Input id="amount" type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مثلاً 12500000" className="mt-1" />
              {amount && <p className="text-xs text-muted-foreground mt-1">{new Intl.NumberFormat("fa-IR").format(Number(amount) || 0)} ریال</p>}
            </div>
            <div>
              <Label>روش پرداخت</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(methodLabels) as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>{methodLabels[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>شعبه *</Label>
              <Select value={branchId} onValueChange={(v) => { setBranchId(v); setAccountId(""); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>حساب مالی *</Label>
              <Select value={accountId} onValueChange={setAccountId} disabled={!branchId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={branchId ? "انتخاب حساب" : "ابتدا شعبه را انتخاب کنید"} /></SelectTrigger>
                <SelectContent>
                  {filteredAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>طرف حساب (تامین‌کننده / مشتری / کارمند)</Label>
              <Input value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder="مثلاً شرکت کوکاکولا" className="mt-1" />
            </div>
            <div>
              <Label>دسته‌بندی</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="مثلاً نوشیدنی، قبوض، حقوق" className="mt-1" />
            </div>

            <div className="md:col-span-2">
              <Label>کد ارجاع (سفارش / فاکتور)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="مثلاً ORD-12345" className="mt-1" />
            </div>

            <div className="md:col-span-2">
              <Label>توضیحات</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1" placeholder="جزئیات تکمیلی تراکنش..." />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/40 border border-border">
            <div>
              <p className="text-sm font-medium">ثبت خودکار پس از ذخیره</p>
              <p className="text-xs text-muted-foreground mt-1">
                در صورت غیرفعال بودن، تراکنش به صف «در انتظار تایید» می‌رود و پس از تایید مدیر اعمال می‌شود.
              </p>
            </div>
            <Switch checked={autoPost} onCheckedChange={setAutoPost} />
          </div>

          <div className={cn("p-3 rounded-lg border-r-4 bg-card", selectedTypeMeta.flow === "in" ? "border-r-success" : "border-r-destructive")}>
            <p className="text-xs text-muted-foreground">پیش‌نمایش جریان وجه</p>
            <p className="text-sm font-semibold mt-1">
              {selectedTypeMeta.flow === "in" ? "افزایش" : "کاهش"} موجودی حساب به مبلغ{" "}
              <span className={selectedTypeMeta.flow === "in" ? "text-success" : "text-destructive"}>
                {amount ? new Intl.NumberFormat("fa-IR").format(Number(amount) || 0) : "—"} ریال
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "در حال ذخیره..." : autoPost ? "ثبت و اعمال" : "ارسال برای تایید"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
