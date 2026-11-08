import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Plus, CheckCheck, X, Pencil, ChevronRight, ChevronLeft } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, Transaction } from "@/types/finance";
import { PagedResult } from "@/lib/safe-api";
import { TransactionStatusBadge, TransactionTypeBadge } from "@/components/finance/TransactionBadges";
import { TransactionFormDialog } from "@/components/finance/TransactionFormDialog";
import { useToast } from "@/hooks/use-toast";

export default function FinanceTransactions() {
  const { toast } = useToast();
  const [data, setData] = useState<PagedResult<Transaction>>({
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [branchId, setBranchId] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await FinanceService.getTransactions({
        pageIndex,
        pageSize,
        search,
        type,
        status,
        branchId,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FinanceService.getBranches().then(setBranches);
  }, []);

  useEffect(() => {
    reload();
  }, [pageIndex, pageSize, type, status, branchId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    reload();
  };

  const handleApprove = async (id: string) => {
    await FinanceService.approveTransaction(id, "مدیر مالی");
    toast({ title: "تراکنش تایید شد", description: "به‌صورت خودکار ثبت نهایی شد" });
    reload();
  };

  const handleReject = async (id: string) => {
    await FinanceService.rejectTransaction(id, "مدیر مالی");
    toast({ title: "تراکنش رد شد", variant: "destructive" });
    reload();
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setDialogOpen(true);
  };

  const exportToExcel = () => {
    if (data.items.length === 0) {
      toast({ title: "داده‌ای برای خروجی وجود ندارد", variant: "destructive" });
      return;
    }
    const headers = ["کد تراکنش", "نوع", "طرف حساب", "شعبه", "دسته‌بندی", "مبلغ (ریال)", "وضعیت", "روش پرداخت", "کد ارجاع", "تاریخ"];
    const rows = data.items.map((t) => {
      const branchName = branches.find((b) => b.id === t.branchId)?.name || "مرکزی";
      return [
        t.code,
        t.type,
        `"${(t.counterparty || '').replace(/"/g, '""')}"`,
        `"${branchName.replace(/"/g, '""')}"`,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.amount,
        t.status,
        t.method,
        `"${(t.reference || '').replace(/"/g, '""')}"`,
        new Date(t.date).toLocaleDateString("fa-IR"),
      ].join(",");
    });

    // UTF-8 BOM so Excel opens Persian text without character corruption
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_page${pageIndex}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "فایل خروجی دانلود شد", description: "گزارش تراکنش‌ها در قالب فایل استاندارد اکسل/CSV ذخیره شد." });
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تراکنش‌های مالی</h1>
          <p className="text-sm text-muted-foreground">
            تمام درآمد، هزینه، خرید، فروش و انتقالات وجوه ({data.totalCount.toLocaleString("fa-IR")} تراکنش کل)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 ml-2" /> خروجی Excel
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 ml-2" /> تراکنش جدید
          </Button>
        </div>
      </div>

      <Card className="p-4 border-0">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در کد، طرف حساب، ارجاع... (Enter)"
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              setPageIndex(1);
            }}
          >
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
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPageIndex(1);
            }}
          >
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
          <Select
            value={branchId}
            onValueChange={(v) => {
              setBranchId(v);
              setPageIndex(1);
            }}
          >
            <SelectTrigger><SelectValue placeholder="شعبه" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شعب</SelectItem>
              {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </form>
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
              {data.items.map((t) => {
                const branch = branches.find((b) => b.id === t.branchId);
                const isIncome = ["sale", "refund", "income_other"].includes(t.type);
                return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell><TransactionTypeBadge type={t.type} /></TableCell>
                    <TableCell className="text-sm">{t.counterparty || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.category || "—"}</TableCell>
                    <TableCell className={`font-semibold ${isIncome ? "text-success" : "text-destructive"}`}>
                      {isIncome ? "+" : "-"} {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell><TransactionStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-left">
                      {t.status === "pending" ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success" onClick={() => handleApprove(t.id)} title="تایید"><CheckCheck className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleReject(t.id)} title="رد"><X className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(t)} title="ویرایش"><Pencil className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    {loading ? "در حال دریافت اطلاعات..." : "تراکنشی یافت نشد"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>تعداد در صفحه:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPageIndex(1);
              }}
            >
              <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">۵</SelectItem>
                <SelectItem value="10">۱۰</SelectItem>
                <SelectItem value="25">۲۵</SelectItem>
                <SelectItem value="50">۵۰</SelectItem>
              </SelectContent>
            </Select>
            <span>
              نمایش صفحه {data.pageIndex.toLocaleString("fa-IR")} از {data.totalPages.toLocaleString("fa-IR")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={!data.hasPreviousPage || loading}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              قبلی
            </Button>
            <span className="px-2 font-mono">{data.pageIndex}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={!data.hasNextPage || loading}
              onClick={() => setPageIndex((p) => Math.min(data.totalPages, p + 1))}
            >
              بعدی
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} onSaved={reload} />
    </div>
  );
}
