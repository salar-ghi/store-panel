import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck, X, Clock, ShieldCheck, Search, Inbox, History } from "lucide-react";
import { ApprovalLog, FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, Transaction } from "@/types/finance";
import { TransactionStatusBadge, TransactionTypeBadge } from "@/components/finance/TransactionBadges";
import { useToast } from "@/hooks/use-toast";

export default function FinanceApprovals() {
  const { toast } = useToast();
  const [list, setList] = useState<Transaction[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Transaction | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  const reload = () => {
    FinanceService.getTransactions().then(setList);
    FinanceService.getApprovalLogs().then(setLogs);
  };

  useEffect(() => {
    reload();
    FinanceService.getBranches().then(setBranches);
  }, []);

  const pending = useMemo(
    () => list.filter((t) => t.status === "pending" && (!search || `${t.code} ${t.counterparty}`.toLowerCase().includes(search.toLowerCase()))),
    [list, search]
  );
  const scheduled = useMemo(() => list.filter((t) => t.status === "scheduled"), [list]);
  const recent = useMemo(
    () => list.filter((t) => t.approvedBy).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30),
    [list]
  );

  const totalPendingAmount = pending.reduce((s, t) => s + t.amount, 0);

  const confirmAction = async () => {
    if (!target || !action) return;
    if (action === "approve") {
      await FinanceService.approveTransaction(target.id, "مدیر مالی", note);
      toast({ title: "تراکنش تایید و اعمال شد" });
    } else {
      await FinanceService.rejectTransaction(target.id, "مدیر مالی", note);
      toast({ title: "تراکنش رد شد", variant: "destructive" });
    }
    setTarget(null); setAction(null); setNote("");
    reload();
  };

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "—";

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> صف تایید مالی</h1>
          <p className="text-sm text-muted-foreground">تراکنش‌های در انتظار تایید مدیر را بررسی و پس از تایید به‌صورت خودکار ثبت کنید.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 bg-warning/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">در انتظار تایید</p>
              <p className="text-2xl font-bold mt-1">{pending.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/15 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
          </div>
        </Card>
        <Card className="p-4 border-0 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">جمع مبلغ در صف</p>
              <p className="text-lg font-bold mt-1">{formatCurrency(totalPendingAmount)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center"><Inbox className="h-5 w-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-4 border-0 bg-success/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">پرداخت‌های زمان‌بندی شده</p>
              <p className="text-2xl font-bold mt-1">{scheduled.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/15 flex items-center justify-center"><CheckCheck className="h-5 w-5 text-success" /></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">صف تایید ({pending.length})</TabsTrigger>
          <TabsTrigger value="scheduled">زمان‌بندی شده ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 ml-1" /> تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="جستجو در کد یا طرف حساب..." className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {pending.length === 0 ? (
            <Card className="p-10 text-center border-0">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">هیچ تراکنشی در انتظار تایید نیست.</p>
            </Card>
          ) : (
            pending.map((t) => (
              <Card key={t.id} className="p-4 border-0 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                      <TransactionTypeBadge type={t.type} />
                      <TransactionStatusBadge status={t.status} />
                      {t.isAutomated && <Badge variant="outline" className="text-xs">خودکار</Badge>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><p className="text-xs text-muted-foreground">طرف حساب</p><p className="font-medium">{t.counterparty || "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">شعبه</p><p className="font-medium">{branchName(t.branchId)}</p></div>
                      <div><p className="text-xs text-muted-foreground">دسته</p><p className="font-medium">{t.category || "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">مبلغ</p><p className="font-bold text-primary">{formatCurrency(t.amount)}</p></div>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground border-r-2 border-border pr-2">{t.description}</p>}
                  </div>
                  <div className="flex md:flex-col gap-2 md:w-32">
                    <Button size="sm" className="flex-1" onClick={() => { setTarget(t); setAction("approve"); }}>
                      <CheckCheck className="h-4 w-4 ml-1" /> تایید
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive hover:bg-destructive/10" onClick={() => { setTarget(t); setAction("reject"); }}>
                      <X className="h-4 w-4 ml-1" /> رد
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4 space-y-3">
          {scheduled.length === 0 ? (
            <Card className="p-10 text-center border-0 text-muted-foreground">پرداخت زمان‌بندی شده‌ای وجود ندارد.</Card>
          ) : (
            scheduled.map((t) => (
              <Card key={t.id} className="p-4 border-0 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                    <TransactionTypeBadge type={t.type} />
                  </div>
                  <p className="text-sm">{t.counterparty} • {branchName(t.branchId)}</p>
                </div>
                <p className="font-bold text-primary">{formatCurrency(t.amount)}</p>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-2">
          {logs.length === 0 && recent.length === 0 ? (
            <Card className="p-10 text-center border-0 text-muted-foreground">تاریخچه‌ای ثبت نشده است.</Card>
          ) : (
            <>
              {logs.map((log, i) => {
                const tx = list.find((t) => t.id === log.transactionId);
                return (
                  <Card key={i} className="p-3 border-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${log.action === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {log.action === "approved" ? <CheckCheck className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx?.code} • {tx?.counterparty}</p>
                        <p className="text-xs text-muted-foreground">{log.action === "approved" ? "تایید" : "رد"} توسط {log.approver}{log.note ? ` — ${log.note}` : ""}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleString("fa-IR")}</p>
                  </Card>
                );
              })}
              {recent.filter((r) => !logs.some((l) => l.transactionId === r.id)).map((t) => (
                <Card key={t.id} className="p-3 border-0 flex items-center justify-between gap-3 opacity-80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                    <TransactionStatusBadge status={t.status} />
                    <span className="text-sm">{t.counterparty}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.approvedBy ?? "—"}</span>
                </Card>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!target} onOpenChange={(o) => { if (!o) { setTarget(null); setAction(null); setNote(""); } }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "تایید نهایی تراکنش" : "رد تراکنش"}</DialogTitle>
          </DialogHeader>
          {target && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{target.code}</span>
                  <TransactionTypeBadge type={target.type} />
                </div>
                <p className="text-sm mt-2">{target.counterparty} • {branchName(target.branchId)}</p>
                <p className="text-lg font-bold text-primary mt-1">{formatCurrency(target.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">یادداشت {action === "reject" && <span className="text-destructive">*</span>}</label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1" placeholder={action === "approve" ? "توضیحات اختیاری..." : "دلیل رد تراکنش..."} />
              </div>
              <p className="text-xs text-muted-foreground">
                {action === "approve" ? "پس از تایید، تراکنش به‌صورت خودکار به وضعیت «تکمیل شده» منتقل و در حساب اعمال می‌شود." : "این عمل قابل بازگشت نیست."}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setTarget(null); setAction(null); setNote(""); }}>انصراف</Button>
            <Button
              variant={action === "reject" ? "destructive" : "default"}
              disabled={action === "reject" && !note.trim()}
              onClick={confirmAction}
            >
              {action === "approve" ? "تایید و ثبت نهایی" : "رد تراکنش"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
