import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateBill, useUpdateBill, useFinanceBranches, useFinanceAccounts } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { RecurringBill } from "@/types/finance";

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: RecurringBill | null;
}

export function BillFormDialog({ open, onOpenChange, initial }: BillFormDialogProps) {
  const { toast } = useToast();
  const { data: branches = [] } = useFinanceBranches();
  const { data: accounts = [] } = useFinanceAccounts();

  const createMutation = useCreateBill();
  const updateMutation = useUpdateBill();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<RecurringBill["category"]>("utility");
  const [amount, setAmount] = useState<number>(0);
  const [branchId, setBranchId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [cycle, setCycle] = useState<RecurringBill["cycle"]>("monthly");
  const [nextDueDate, setNextDueDate] = useState<string>("");
  const [vendor, setVendor] = useState("");
  const [autoPay, setAutoPay] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setCategory(initial.category);
      setAmount(initial.amount);
      setBranchId(initial.branchId);
      setAccountId(initial.accountId);
      setCycle(initial.cycle);
      setNextDueDate(initial.nextDueDate ? initial.nextDueDate.slice(0, 10) : "");
      setVendor(initial.vendor || "");
      setAutoPay(initial.autoPay);
      setIsActive(initial.isActive);
    } else {
      setName("");
      setCategory("utility");
      setAmount(0);
      setBranchId(branches[0]?.id || "");
      setAccountId(accounts[0]?.id || "");
      setCycle("monthly");
      setNextDueDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      setVendor("");
      setAutoPay(false);
      setIsActive(true);
    }
  }, [initial, open, branches, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0 || !branchId || !accountId) {
      toast({ title: "لطفاً تمامی فیلدهای الزامی را تکمیل کنید", variant: "destructive" });
      return;
    }

    try {
      if (initial) {
        await updateMutation.mutateAsync({
          id: initial.id,
          patch: {
            name: name.trim(),
            category,
            amount: Number(amount),
            branchId,
            accountId,
            cycle,
            nextDueDate: new Date(nextDueDate).toISOString(),
            vendor: vendor.trim() || undefined,
            autoPay,
            isActive,
          },
        });
        toast({ title: "قبض با موفقیت ویرایش شد" });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          category,
          amount: Number(amount),
          currency: "IRR",
          branchId,
          accountId,
          cycle,
          nextDueDate: new Date(nextDueDate).toISOString(),
          vendor: vendor.trim() || undefined,
          autoPay,
          isActive,
        });
        toast({ title: "قبض جدید ثبت شد" });
      }
      onOpenChange(false);
    } catch {
      toast({ title: "خطا در ثبت قبض", variant: "destructive" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "ویرایش قبض" : "افزودن قبض یا پرداخت دوره‌ای"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bill-name">عنوان قبض <span className="text-destructive">*</span></Label>
            <Input
              id="bill-name"
              placeholder="مثال: قبض برق شعبه مرکزی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>دسته‌بندی</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as RecurringBill["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="utility">قبوض خدماتی (آب، برق، گاز)</SelectItem>
                  <SelectItem value="rent">اجاره بها</SelectItem>
                  <SelectItem value="internet">اینترنت و تلفن</SelectItem>
                  <SelectItem value="insurance">بیمه</SelectItem>
                  <SelectItem value="tax">مالیات و عوارض</SelectItem>
                  <SelectItem value="other">سایر خدمات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-amount">مبلغ (ریال) <span className="text-destructive">*</span></Label>
              <Input
                id="bill-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>شعبه <span className="text-destructive">*</span></Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>حساب پرداخت <span className="text-destructive">*</span></Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="انتخاب حساب" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>دوره پرداخت</Label>
              <Select value={cycle} onValueChange={(v) => setCycle(v as RecurringBill["cycle"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">ماهانه</SelectItem>
                  <SelectItem value="quarterly">فصلی (۳ ماهه)</SelectItem>
                  <SelectItem value="yearly">سالانه</SelectItem>
                  <SelectItem value="weekly">هفتگی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-date">تاریخ سررسید بعدی</Label>
              <Input
                id="bill-date"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bill-vendor">طرف حساب / شرکت ارائه‌دهنده</Label>
            <Input
              id="bill-vendor"
              placeholder="مثال: شرکت توزیع نیروی برق"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div>
              <span className="text-sm font-medium">پرداخت خودکار (Auto Pay)</span>
              <p className="text-xs text-muted-foreground">در تاریخ سررسید از حساب منتخب پرداخت شود</p>
            </div>
            <Switch checked={autoPay} onCheckedChange={setAutoPay} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "در حال ثبت..." : initial ? "ذخیره تغییرات" : "افزودن قبض"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
