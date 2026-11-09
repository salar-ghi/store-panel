import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Plus, CheckCheck, X, Pencil, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/services/finance-service";
import { Transaction } from "@/types/finance";
import { TransactionStatusBadge, TransactionTypeBadge } from "@/components/finance/TransactionBadges";
import { exportToCsv } from "@/lib/export-utils";
import { TransactionFormDialog } from "@/components/finance/TransactionFormDialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import {
  useFinanceBranches,
  useFinanceTransactions,
  useApproveTransaction,
  useRejectTransaction,
} from "@/hooks/use-finance";

export default function FinanceTransactions() {
  const { toast } = useToast();

  // Server-side query state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [branchId, setBranchId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: branches = [] } = useFinanceBranches();

  const {
    data: txData,
    isLoading: loading,
  } = useFinanceTransactions({
    pageIndex,
    pageSize,
    search: debouncedSearch.trim() || undefined,
    sortBy,
    type,
    status,
    branchId,
  });

  const list = txData?.items ?? [];
  const totalCount = txData?.totalCount ?? 0;

  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id, approver: "مدیر مالی" });
      toast({ title: "تراکنش تایید شد", description: "به‌صورت خودکار ثبت نهایی شد" });
    } catch {
      toast({ title: "خطا در تایید تراکنش", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, approver: "مدیر مالی" });
      toast({ title: "تراکنش رد شد", variant: "destructive" });
    } catch {
      toast({ title: "خطا در رد تراکنش", variant: "destructive" });
    }
  };

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (t: Transaction) => { setEditing(t); setDialogOpen(true); };

  const handleExportExcel = () => {
    if (list.length === 0) {
      toast({ title: "داده‌ای برای خروجی اکسل وجود ندارد", variant: "destructive" });
      return;
    }

    const headers = [
      "کد تراکنش",
      "نوع",
      "طرف حساب",
      "شعبه",
      "دسته‌بندی",
      "مبلغ (ریال)",
      "وضعیت",
      "روش پرداخت",
      "تاریخ",
    ];

    const rows = list.map((t) => {
      const branch = branches.find((b) => b.id === t.branchId);
      return [
        t.code,
        t.type,
        t.counterparty || "—",
        branch?.name || "مرکزی",
        t.category || "—",
        t.amount,
        t.status,
        t.method,
        new Date(t.date).toLocaleDateString("fa-IR"),
      ];
    });

    exportToCsv(`finance-transactions-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: "فایل اکسل تراکنش‌ها با موفقیت دانلود شد" });
  };

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPageIndex(1);
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تراکنش‌های مالی</h1>
          <p className="text-sm text-muted-foreground">تمام درآمد، هزینه، خرید، فروش و انتقالات وجوه (صفحه‌بندی سمت سرور)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 ml-2" /> خروجی Excel
          </Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 ml-2" /> تراکنش جدید</Button>
        </div>
      </div>

      <Card className="p-4 border-0">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در کد، طرف حساب، ارجاع..."
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={handleFilterChange(setType)}>
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
          <Select value={status} onValueChange={handleFilterChange(setStatus)}>
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
          <Select value={branchId} onValueChange={handleFilterChange(setBranchId)}>
            <SelectTrigger><SelectValue placeholder="شعبه" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شعب</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleFilterChange(setSortBy)}>
            <SelectTrigger>
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="مرتب‌سازی" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">جدیدترین</SelectItem>
              <SelectItem value="date_asc">قدیمی‌ترین</SelectItem>
              <SelectItem value="amount_desc">بیشترین مبلغ</SelectItem>
              <SelectItem value="amount_asc">کمترین مبلغ</SelectItem>
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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="p-4">
                      <Skeleton className="h-7 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    تراکنشی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                list.map((t) => {
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
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-success"
                              onClick={() => handleApprove(t.id)}
                              disabled={approveMutation.isPending}
                              title="تایید"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleReject(t.id)}
                              disabled={rejectMutation.isPending}
                              title="رد"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(t)} title="ویرایش">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => openEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t p-2">
          <DataTablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPageIndex}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPageIndex(1);
            }}
            isLoading={loading}
          />
        </div>
      </Card>

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} />
    </div>
  );
}
