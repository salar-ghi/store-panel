import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Plus, Filter, CheckCheck, X } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, Transaction } from "@/types/finance";
import { TransactionStatusBadge, TransactionTypeBadge } from "@/components/finance/TransactionBadges";

export default function FinanceTransactions() {
  const [list, setList] = useState<Transaction[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [branchId, setBranchId] = useState<string>("all");

  useEffect(() => {
    FinanceService.getTransactions().then(setList);
    FinanceService.getBranches().then(setBranches);
  }, []);

  const filtered = useMemo(() => {
    return list.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (status !== "all" && t.status !== status) return false;
      if (branchId !== "all" && t.branchId !== branchId) return false;
      if (search && !`${t.code} ${t.counterparty} ${t.reference}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [list, type, status, branchId, search]);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تراکنش‌های مالی</h1>
          <p className="text-sm text-muted-foreground">تمام درآمد، هزینه، خرید، فروش و انتقالات وجوه</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 ml-2" /> خروجی Excel</Button>
          <Button size="sm"><Plus className="h-4 w-4 ml-2" /> تراکنش جدید</Button>
        </div>
      </div>

      <Card className="p-4 border-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="جستجو در کد، طرف حساب، ارجاع..." className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="نوع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              <SelectItem value="sale">فروش</SelectItem>
              <SelectItem value="purchase">خرید</SelectItem>
              <SelectItem value="expense">هزینه</SelectItem>
              <SelectItem value="salary">حقوق</SelectItem>
              <SelectItem value="bill">قبض</SelectItem>
              <SelectItem value="refund">بازگشت وجه</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="pending">در انتظار تایید</SelectItem>
              <SelectItem value="approved">تایید شده</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
              <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
              <SelectItem value="rejected">رد شده</SelectItem>
            </SelectContent>
          </Select>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger><SelectValue placeholder="شعبه" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شعب</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>کد</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>طرف حساب</TableHead>
                <TableHead>شعبه</TableHead>
                <TableHead>دسته</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const branch = branches.find((b) => b.id === t.branchId);
                const isIncome = ["sale", "refund", "income_other"].includes(t.type);
                return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell><TransactionTypeBadge type={t.type} /></TableCell>
                    <TableCell className="text-sm">{t.counterparty}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.category}</TableCell>
                    <TableCell className={`font-semibold ${isIncome ? "text-success" : "text-destructive"}`}>
                      {isIncome ? "+" : "-"} {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell><TransactionStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-left">
                      {t.status === "pending" ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success"><CheckCheck className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"><X className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8"><Filter className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">تراکنشی یافت نشد</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
