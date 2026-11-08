import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, CheckCircle2, ShieldCheck, Scale, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FinanceService } from "@/services/finance-service";
import { ChartOfAccount } from "@/types/finance";

const typeLabels: Record<string, { label: string; color: string }> = {
  "1": { label: "دارایی (Asset)", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "2": { label: "بدهی (Liability)", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  "3": { label: "حقوق صاحبان سهام (Equity)", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  "4": { label: "درآمد (Revenue)", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  "5": { label: "هزینه (Expense)", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  "6": { label: "کاهنده دارایی (Contra-Asset)", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  "7": { label: "کاهنده درآمد (Contra-Revenue)", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  Asset: { label: "دارایی", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  Liability: { label: "بدهی", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  Equity: { label: "سرمایه", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  Revenue: { label: "درآمد", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  Expense: { label: "هزینه", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

export default function FinanceLedger() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  useEffect(() => {
    FinanceService.getChartOfAccounts().then(setAccounts);
  }, []);

  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const typeStr = String(acc.type);
      if (selectedTab !== "all" && typeStr !== selectedTab) return false;
      if (search && !`${acc.code} ${acc.name}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [accounts, search, selectedTab]);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            دفتر کل و سرفصل حساب‌ها (Chart of Accounts)
          </h1>
          <p className="text-sm text-muted-foreground">
            مدیریت درخت حساب‌های استاندارد مالی دوبل، ماهیت بدهکار/بستانکار و اسناد سیستمی
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ArrowDownLeft className="h-4 w-4 text-blue-500" />
            حساب‌های دارایی و موجودی
          </div>
          <div className="text-2xl font-bold mt-1">
            {accounts.filter((a) => String(a.type) === "1" || a.type === "Asset").length} سرفصل
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-red-500/10 to-transparent">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4 text-red-500" />
            بدهی‌ها و تعهدات
          </div>
          <div className="text-2xl font-bold mt-1">
            {accounts.filter((a) => String(a.type) === "2" || a.type === "Liability").length} سرفصل
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-green-500/10 to-transparent">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-green-500" />
            درآمد و فروش
          </div>
          <div className="text-2xl font-bold mt-1">
            {accounts.filter((a) => String(a.type) === "4" || a.type === "Revenue").length} سرفصل
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-orange-500/10 to-transparent">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            هزینه‌های عملیاتی
          </div>
          <div className="text-2xl font-bold mt-1">
            {accounts.filter((a) => String(a.type) === "5" || a.type === "Expense").length} سرفصل
          </div>
        </Card>
      </div>

      <Card className="p-4 border-0">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در کد حساب یا عنوان..."
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">همه</TabsTrigger>
              <TabsTrigger value="1">دارایی</TabsTrigger>
              <TabsTrigger value="2">بدهی</TabsTrigger>
              <TabsTrigger value="3">سرمایه</TabsTrigger>
              <TabsTrigger value="4">درآمد</TabsTrigger>
              <TabsTrigger value="5">هزینه</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      <Card className="border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>کد حساب</TableHead>
                <TableHead>عنوان سرفصل حساب</TableHead>
                <TableHead>طبقه حسابداری</TableHead>
                <TableHead>ماهیت حساب</TableHead>
                <TableHead>قابلیت صدور سند</TableHead>
                <TableHead>نوع حساب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((acc) => {
                const typeInfo = typeLabels[String(acc.type)] || { label: String(acc.type), color: "" };
                const isDebit = String(acc.normalBalance) === "1" || acc.normalBalance === "Debit";
                return (
                  <TableRow key={acc.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-sm text-primary">{acc.code}</TableCell>
                    <TableCell className="font-medium text-sm">{acc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {isDebit ? "بدهکار (Debit)" : "بستانکار (Credit)"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {acc.isPostingAllowed ? (
                        <span className="flex items-center gap-1 text-xs text-success font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> مجاز
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">صرفاً سرفصل کل</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {acc.isSystemAccount ? (
                        <Badge variant="outline" className="text-xs bg-muted">سیستمی / اتوماتیک</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">کاربری</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    هیچ حسابی یافت نشد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
