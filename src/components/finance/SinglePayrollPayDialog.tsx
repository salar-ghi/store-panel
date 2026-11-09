import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceAccounts, usePayPayrollEntry } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/services/finance-service";
import { PayrollEntry } from "@/types/finance";
import { CheckCheck } from "lucide-react";

interface SinglePayrollPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PayrollEntry | null;
}

export function SinglePayrollPayDialog({ open, onOpenChange, entry }: SinglePayrollPayDialogProps) {
  const { toast } = useToast();
  const { data: accounts = [] } = useFinanceAccounts();
  const payMutation = usePayPayrollEntry();

  const [accountId, setAccountId] = useState("");
  const [note, setNote] = useState("");

  const handlePay = async () => {
    if (!entry) return;
    if (!accountId) {
      toast({ title: "لطفاً حساب مبدا پرداخت را انتخاب کنید", variant: "destructive" });
      return;
    }

    try {
      await payMutation.mutateAsync({
        id: entry.id,
        accountId,
        note: note.trim() || undefined,
      });

      toast({
        title: "حقوق پرسنل با موفقیت واریز شد",
        description: `مبلغ ${formatCurrency(entry.netPay)} به ${entry.employeeName} پرداخت و وضعیت آن به «پرداخت شده» تغییر یافت.`,
      });
      onOpenChange(false);
      setNote("");
    } catch {
      toast({ title: "خطا در تسویه حقوق", variant: "destructive" });
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-success" /> تسویه انفرادی حقوق پرسنل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted/40 space-y-1">
            <div className="font-semibold text-base">{entry.employeeName}</div>
            <div className="text-xs text-muted-foreground">{entry.position || "پرسنل"} — دوره {entry.period}</div>
            <div className="text-lg font-bold text-success mt-2">{formatCurrency(entry.netPay)}</div>
          </div>

          <div className="space-y-1.5">
            <Label>حساب بانکی کسر وجه <span className="text-destructive">*</span></Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="pay-note">یادداشت و شماره پیگیری ساتنا/پایا</Label>
            <Textarea
              id="pay-note"
              placeholder="شماره پیگیری فیش..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button disabled={payMutation.isPending} onClick={handlePay}>
            {payMutation.isPending ? "در حال پرداخت..." : "تایید پرداخت و ثبت سند"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
