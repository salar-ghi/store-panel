import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceAccounts, useRunPayrollCycle, useFinanceBranches } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/services/finance-service";
import { PlayCircle } from "lucide-react";

interface PayrollCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingTotal: number;
  pendingCount: number;
}

export function PayrollCycleDialog({
  open,
  onOpenChange,
  pendingTotal,
  pendingCount,
}: PayrollCycleDialogProps) {
  const { toast } = useToast();
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: branches = [] } = useFinanceBranches();
  const runCycleMutation = useRunPayrollCycle();

  const [accountId, setAccountId] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [period, setPeriod] = useState("1404-01");

  const handleRun = async () => {
    if (!accountId) {
      toast({ title: "لطفاً حساب بانکی پرداخت حقوق را انتخاب نمایید", variant: "destructive" });
      return;
    }

    try {
      const res = await runCycleMutation.mutateAsync({
        period,
        branchId: branchId && branchId !== "all" ? branchId : undefined,
        accountId,
      });

      toast({
        title: "اجرای دوره حقوق با موفقیت تکمیل شد",
        description: `حقوق ${res?.processedCount ?? pendingCount} نفر از پرسنل به مبلغ ${formatCurrency(res?.totalAmount ?? pendingTotal)} واریز و وضعیت آن‌ها به پرداخت‌شده تغییر یافت.`,
      });
      onOpenChange(false);
    } catch {
      toast({ title: "خطا در پردازش دسته جمعی حقوق", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" /> اجرای دوره و واریز گروهی حقوق
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border space-y-2">
            <div className="text-xs text-muted-foreground">خلاصه صف واریز این دوره:</div>
            <div className="flex justify-between items-center text-sm">
              <span>تعداد فیش‌های در انتظار:</span>
              <span className="font-bold">{pendingCount} پرسنل</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>مجموع مبلغ پرداختی:</span>
              <span className="font-bold text-primary text-base">{formatCurrency(pendingTotal)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>شعبه مورد نظر جهت تسویه</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">تمام شعب (تسویه متمرکز سراسری)</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>حساب بانکی شرکت جهت پرداخت حقوق <span className="text-destructive">*</span></Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="انتخاب حساب بانکی..." /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} — موجودی: {formatCurrency(a.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-warning/10 text-xs text-warning border border-warning/20">
            با کلیک روی اجرای دوره، فرآیند صدور سند پایا/ساتنا شبیه‌سازی شده و سند حسابداری کسر از حساب شرکت در سیستم ثبت خواهد شد.
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            disabled={runCycleMutation.isPending || pendingCount === 0}
            onClick={handleRun}
          >
            {runCycleMutation.isPending ? "در حال واریز و صدور اسناد..." : "تایید و اجرای واریز حقوق"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
