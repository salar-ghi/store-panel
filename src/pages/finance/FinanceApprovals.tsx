import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck, X, Clock, ShieldCheck, Search, Inbox, History, Filter } from "lucide-react";
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
  const [thresholdFilter, setThresholdFilter] = useState<string>("all");
  const [target, setTarget] = useState<Transaction | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  const reload = () => {
    FinanceService.getAllTransactions().then(setList);
    FinanceService.getApprovalLogs().then(setLogs);
  };

  useEffect(() => {
    reload();
    FinanceService.getBranches().then(setBranches);
  }, []);

  const pending = useMemo(
    () =>
      list.filter((t) => {
        if (t.status !== "pending") return false;
        if (thresholdFilter === "under50m" && t.amount >= 50_000_000) return false;
        if (thresholdFilter === "50mTo500m" && (t.amount < 50_000_000 || t.amount > 500_000_000)) return false;
        if (thresholdFilter === "above500m" && t.amount <= 500_000_000) return false;
        if (search && !`${t.code} ${t.counterparty} ${t.reference}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [list, search, thresholdFilter]
  );

  const scheduled = useMemo(() => list.filter((t) => t.status === "scheduled"), [list]);
  const recent = useMemo(
    () => list.filter((t) => ["approved", "completed", "rejected"].includes(t.status)).slice(0, 10),
    [list]
  );

  const handleDecision = async () => {
    if (!target || !action) return;
    if (action === "approve") {
      await FinanceService.approveTransaction(target.id, "مدیر مالی ارشد", note);
      toast({ title: "تراکنش با موفقیت تایید شد", description: `${target.code} تایید و ثبت دفتر شد.` });
    } else {
      await FinanceService.rejectTransaction(target.id, "مدیر مالی ارشد", note);
      toast({ title: "تراکنش رد شد", description: `${target.code} رد گردید.`, variant: "destructive" });
    }
    setTarget(null);
    setAction(null);
    setNote("");
    reload();
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          صف تاییدات و انضباط مالی
        </h1>
        <p className="text-sm text-muted-foreground">
          کنترل دو مرحله‌ای پرداخت‌ها، هزینه‌های خارج از سقف مجاز، چک‌ها و اسناد مالی
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-warning/15 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">در انتظار تایید شما</div>
              <div className="text-3xl font-bold mt-1 text-warning">{pending.length}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-warning/20 text-warning flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3">
            مجموع مبلغ: {formatCurrency(pending.reduce((s, t) => s + t.amount, 0))}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-info/15 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">زمان‌بندی شده</div>
              <div className="text-3xl font-bold mt-1 text-info">{scheduled.length}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-info/20 text-info flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3">پرداخت در سررسیدهای آتی</div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-success/15 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">اقدامات اخیر</div>
              <div className="text-3xl font-bold mt-1 text-success">{recent.length}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-success/20 text-success flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3">تایید یا رد شده در ۲۴ ساعت گذشته</div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" /> در انتظار ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> تاریخچه لاگ تاییدات ({logs.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select value={thresholdFilter} onValueChange={setThresholdFilter}>
              <SelectTrigger className="w-[190px] text-xs">
                <Filter className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                <SelectValue placeholder="سقف اختیارات مالی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه مبالغ</SelectItem>
                <SelectItem value="under50m">زیر ۵۰ میلیون ریال (شعبه)</SelectItem>
                <SelectItem value="50mTo500m">۵۰ تا ۵۰۰ میلیون ریال (مدیر مالی)</SelectItem>
                <SelectItem value="above500m">بالای ۵۰۰ میلیون ریال (هیئت مدیره)</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-56">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در صف..."
                className="pr-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-3">
          {pending.map((t) => {
            const branch = branches.find((b) => b.id === t.branchId);
            const isHighAmount = t.amount >= 500_000_000;
            const isMediumAmount = t.amount >= 50_000_000 && t.amount < 500_000_000;
            return (
              <Card key={t.id} className="p-4 border-0 hover-lift flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                    <TransactionTypeBadge type={t.type} />
                    <span className="font-semibold text-sm">{t.counterparty || "نامشخص"}</span>
                    {branch && <Badge variant="outline" className="text-xs">{branch.name}</Badge>}
                    {isHighAmount ? (
                      <Badge variant="destructive" className="text-[10px]">نیاز به تایید هیئت مدیره</Badge>
                    ) : isMediumAmount ? (
                      <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">تایید مدیر مالی</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-info/10 text-info border-info/20">اختیار سرپرست شعبه</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.description || "بدون توضیحات تکمیلی"} • تاریخ: {new Date(t.date).toLocaleDateString("fa-IR")}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-left ml-2">
                    <div className="text-base font-bold text-destructive">{formatCurrency(t.amount)}</div>
                    <div className="text-[10px] text-muted-foreground">{t.method}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setTarget(t);
                      setAction("reject");
                    }}
                  >
                    <X className="h-4 w-4 ml-1" /> رد
                  </Button>
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => {
                      setTarget(t);
                      setAction("approve");
                    }}
                  >
                    <CheckCheck className="h-4 w-4 ml-1" /> تایید
                  </Button>
                </div>
              </Card>
            );
          })}
          {pending.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
              موردی در انتظار تایید وجود ندارد ✨
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          <Card className="p-4 border-0">
            <div className="space-y-2">
              {logs.map((l) => (
                <div key={l.transactionId + l.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant={l.action === "approved" ? "default" : "destructive"}>
                      {l.action === "approved" ? "تایید شده" : "رد شده"}
                    </Badge>
                    <span className="font-mono">{l.transactionId}</span>
                    <span className="text-muted-foreground">توسط {l.approver}</span>
                    {l.note && <span className="italic text-muted-foreground">«{l.note}»</span>}
                  </div>
                  <span className="text-muted-foreground">{new Date(l.date).toLocaleString("fa-IR")}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">تاریخچه ثبتی وجود ندارد</div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Decision Dialog */}
      <Dialog open={!!target} onOpenChange={() => setTarget(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "تایید تراکنش مالی" : "رد تراکنش مالی"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm">
              آیا از {action === "approve" ? "تایید و ثبت نهایی" : "رد کردن"} تراکنش{" "}
              <span className="font-mono font-bold">{target?.code}</span> به مبلغ{" "}
              <span className="font-bold">{target ? formatCurrency(target.amount) : ""}</span> اطمینان دارید؟
            </p>
            <div>
              <Textarea
                placeholder="یادداشت یا علت تصمیم‌گیری (اختیاری)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTarget(null)}>انصراف</Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleDecision}
            >
              ثبت تصمیم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
