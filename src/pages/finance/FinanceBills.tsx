import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Zap, FileText, Calendar, Building, Wifi, ShieldCheck, Receipt } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, RecurringBill } from "@/types/finance";

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
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    FinanceService.getBills().then(setBills);
    FinanceService.getBranches().then(setBranches);
  }, []);

  const totalMonthly = bills.reduce((s, b) => s + (b.cycle === "monthly" ? b.amount : b.cycle === "quarterly" ? b.amount / 3 : b.cycle === "yearly" ? b.amount / 12 : b.amount * 4), 0);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">قبوض و پرداخت‌های دوره‌ای</h1>
          <p className="text-sm text-muted-foreground">مدیریت قبوض خودکار، اجاره، بیمه، مالیات و خدمات</p>
        </div>
        <Button><Plus className="h-4 w-4 ml-2" /> افزودن قبض</Button>
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
          const Icon = icons[b.category];
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
                    <div className="text-xs text-muted-foreground mt-0.5">{labels[b.category]} • {branch?.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{cycleLabels[b.cycle]}</Badge>
                      <Badge variant="outline" className={`text-xs ${urgent ? "bg-destructive/15 text-destructive border-destructive/20" : "bg-info/15 text-info border-info/20"}`}>
                        <Calendar className="h-3 w-3 ml-1" /> {days > 0 ? `${days} روز دیگر` : "سررسید"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-lg font-bold">{formatCurrency(b.amount)}</div>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <span className="text-xs text-muted-foreground">پرداخت خودکار</span>
                    <Switch checked={b.autoPay} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">پرداخت دستی</Button>
                <Button size="sm" variant="ghost">جزئیات</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
