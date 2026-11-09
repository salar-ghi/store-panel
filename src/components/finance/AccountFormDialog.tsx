import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateAccount, useFinanceBranches } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { AccountType, Currency } from "@/types/finance";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBranchId?: string;
}

export function AccountFormDialog({ open, onOpenChange, defaultBranchId }: AccountFormDialogProps) {
  const { toast } = useToast();
  const { data: branches = [] } = useFinanceBranches();
  const createAccountMutation = useCreateAccount();

  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [branchId, setBranchId] = useState<string>(defaultBranchId || "");
  const [currency, setCurrency] = useState<Currency>("IRR");
  const [balance, setBalance] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "لطفاً نام حساب را وارد نمایید", variant: "destructive" });
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        name: name.trim(),
        accountNumber: accountNumber.trim() || undefined,
        type,
        branchId: branchId && branchId !== "all" ? branchId : undefined,
        currency,
        balance: Number(balance) || 0,
        isActive,
      });
      toast({ title: "حساب مالی جدید ایجاد شد" });
      onOpenChange(false);
      setName("");
      setAccountNumber("");
      setBalance(0);
      setIsActive(true);
    } catch {
      toast({ title: "خطا در ثبت حساب مالی", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>افزودن حساب مالی جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">نام حساب <span className="text-destructive">*</span></Label>
            <Input
              id="acc-name"
              placeholder="مثال: بانک ملت - جاری شعبه مرکزی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>نوع حساب</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">بانکی</SelectItem>
                  <SelectItem value="cash">صندوق نقدی</SelectItem>
                  <SelectItem value="gateway">درگاه پرداخت اینترنتی</SelectItem>
                  <SelectItem value="wallet">کیف پول دیجیتال</SelectItem>
                  <SelectItem value="petty_cash">تنخواه‌گردان</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>شعبه مربوطه</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="حساب سازمانی / سراسری" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">حساب مرکزی (بدون شعبه)</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-num">شماره کارت / شبا / حساب</Label>
            <Input
              id="acc-num"
              placeholder="IR..."
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="acc-balance">موجودی اولیه</Label>
              <Input
                id="acc-balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>واحد پول</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IRR">ریال ایران (IRR)</SelectItem>
                  <SelectItem value="USD">دلار آمریکا (USD)</SelectItem>
                  <SelectItem value="EUR">یورو (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <span className="text-sm">وضعیت فعالیت حساب</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button type="submit" disabled={createAccountMutation.isPending}>
              {createAccountMutation.isPending ? "در حال ذخیره..." : "ثبت حساب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
