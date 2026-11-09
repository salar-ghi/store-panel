import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinanceAccounts, usePayBill } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { RecurringBill } from "@/types/finance";
import { formatCurrency } from "@/services/finance-service";
import { CheckCircle2 } from "lucide-react";

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: RecurringBill | null;
}

export function BillPaymentDialog({ open, onOpenChange, bill }: BillPaymentDialogProps) {
  const { toast } = useToast();
  const { data: accounts = [] } = useFinanceAccounts();
  const payBillMutation = usePayBill();

  const [accountId, setAccountId] = useState(bill?.accountId || "");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const handlePay = async () => {
    if (!bill) return;
    const targetAccountId = accountId || bill.accountId;
    if (!targetAccountId) {
      toast({ title: "لطفاً حساب بانکی مبدا را انتخاب کنید", variant: "destructive" });
      return;
    }

    try {
      await payBillMutation.mutateAsync({
        id: bill.id,
        accountId: targetAccountId,
        paymentDate: new Date(paymentDate).toISOString(),
        note: note.trim() || undefined,
      });

      toast({
        title: "تسویه قبض با موفقیت انجام شد",
        description: `سند هزینه به مبلغ ${formatCurrency(bill.amount)} ثبت شد و از حساب کسر گردید.`,
      });
      onOpenChange(false);
      setNote("");
    } catch {
      toast({ title: "خطا در تسویه قبض", variant: "destructive" });
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" /> تسویه و پرداخت دستی قبض
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <div className="text-sm font-semibold">{bill.name}</div>
            <div className="text-xs text-muted-foreground">ارائه‌دهنده: {bill.vendor || "—"}</div>
            <div className="text-lg font-bold text-primary mt-2">{formatCurrency(bill.amount)}</div>
          </div>

          <div className="space-y-1.5">
            <Label>حساب مبدا پرداخت (کسر وجه) <span className="text-destructive">*</span></Label>
            <Select value={accountId || bill.accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="انتخاب حساب بانکی / صندوق" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} (موجودی: {formatCurrency(a.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-date">تاریخ پرداخت</Label>
            <Input
              id="pay-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-note">یادداشت / شماره پیگیری تراکنش بانکی</Label>
            <Textarea
              id="pay-note"
              placeholder="کد رهگیری فیش واریز..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            disabled={payBillMutation.isPending}
            onClick={handlePay}
          >
            {payBillMutation.isPending ? "در حال ثبت پرداخت..." : "تایید پرداخت و کسر از حساب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
