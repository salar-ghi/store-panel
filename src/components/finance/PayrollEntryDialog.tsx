import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePayrollEntry, useFinanceBranches } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/services/finance-service";

interface PayrollEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollEntryDialog({ open, onOpenChange }: PayrollEntryDialogProps) {
  const { toast } = useToast();
  const { data: branches = [] } = useFinanceBranches();
  const createMutation = useCreatePayrollEntry();

  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");
  const [branchId, setBranchId] = useState("");
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [period, setPeriod] = useState("1404-01");

  const netPay = Math.max(0, Number(baseSalary || 0) + Number(bonus || 0) - Number(deductions || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !branchId || baseSalary <= 0) {
      toast({ title: "لطفاً نام، شعبه و حقوق پایه را وارد نمایید", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync({
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        position: position.trim() || undefined,
        branchId,
        baseSalary: Number(baseSalary),
        bonus: Number(bonus) || 0,
        deductions: Number(deductions) || 0,
        netPay,
        currency: "IRR",
        period,
        status: "pending",
      });

      toast({ title: "فیش حقوقی پرسنل با موفقیت ایجاد شد" });
      onOpenChange(false);
      setEmployeeName("");
      setEmployeeId("");
      setPosition("");
      setBaseSalary(0);
      setBonus(0);
      setDeductions(0);
    } catch {
      toast({ title: "خطا در ثبت حقوق پرسنل", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>افزودن پرسنل / فیش حقوقی</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emp-name">نام و نام خانوادگی پرسنل <span className="text-destructive">*</span></Label>
            <Input
              id="emp-name"
              placeholder="مثال: علی رضایی"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emp-pos">سمت / شغل</Label>
              <Input
                id="emp-pos"
                placeholder="صندوق‌دار، حسابدار..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emp-period">دوره حقوقی</Label>
              <Input
                id="emp-period"
                placeholder="1404-01"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-base">حقوق پایه (ریال) <span className="text-destructive">*</span></Label>
              <Input
                id="emp-base"
                type="number"
                value={baseSalary || ""}
                onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emp-bonus">پاداش و اضافه‌کار</Label>
              <Input
                id="emp-bonus"
                type="number"
                value={bonus || ""}
                onChange={(e) => setBonus(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-ded">کسورات (بیمه/مالیات/مساعده)</Label>
              <Input
                id="emp-ded"
                type="number"
                value={deductions || ""}
                onChange={(e) => setDeductions(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 flex items-center justify-between">
            <span className="text-sm font-medium">خالص دریافتی پرسنل:</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(netPay)}</span>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "در حال ثبت..." : "افزودن فیش حقوقی"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
