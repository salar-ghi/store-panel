import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Trash2, CheckCircle2, AlertTriangle, Layers, Scale, Search, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/services/finance-service";
import {
  useFinanceChartOfAccounts,
  useFinanceCostCenters,
  useFinanceJournalEntries,
  useFinanceTrialBalance,
  useCreateJournalEntry,
  useFinanceBranches,
} from "@/hooks/use-finance";
import { ChartOfAccount, JournalEntryLine, AccountNature, AccountLevel } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";

const natureLabels: Record<AccountNature, string> = {
  asset: "دارایی",
  liability: "بدهی",
  equity: "حقوق صاحبان سهام",
  revenue: "درآمد",
  expense: "هزینه",
};

const levelLabels: Record<AccountLevel, string> = {
  group: "گروه",
  general: "کل",
  subsidiary: "معین",
  detail: "تفصیلی",
};

export default function FinanceLedger() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("entries");
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [searchEntry, setSearchEntry] = useState("");

  const { data: accounts = [], isLoading: isAccountsLoading } = useFinanceChartOfAccounts();
  const { data: costCenters = [] } = useFinanceCostCenters();
  const { data: branches = [] } = useFinanceBranches();
  const { data: journalData, isLoading: isEntriesLoading } = useFinanceJournalEntries({
    search: searchEntry || undefined,
  });
  const { data: trialBalance = [], isLoading: isTrialLoading } = useFinanceTrialBalance();

  const createEntryMutation = useCreateJournalEntry();

  // New Journal Entry Form State
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryDesc, setEntryDesc] = useState("");
  const [entryBranchId, setEntryBranchId] = useState<string>("");
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;
  const balanceDiff = Math.abs(totalDebit - totalCredit);

  const addLine = () => {
    setLines((prev) => [...prev, { accountId: "", debit: 0, credit: 0, description: "" }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) {
      toast({ title: "سند حسابداری دوبل باید حداقل دارای ۲ آرتیکل باشد", variant: "destructive" });
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, patch: Partial<JournalEntryLine>) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleCreateEntry = async () => {
    if (!entryDesc.trim()) {
      toast({ title: "لطفاً شرح سند را وارد کنید", variant: "destructive" });
      return;
    }
    if (!isBalanced) {
      toast({
        title: "سند تراز نیست!",
        description: `اختلاف بدهکار و بستانکار برابر با ${formatCurrency(balanceDiff)} است.`,
        variant: "destructive",
      });
      return;
    }
    for (const l of lines) {
      if (!l.accountId) {
        toast({ title: "لطفاً برای تمام ردیف‌ها حساب معین/تفصیلی انتخاب کنید", variant: "destructive" });
        return;
      }
      if ((l.debit || 0) <= 0 && (l.credit || 0) <= 0) {
        toast({ title: "هر ردیف باید دارای مبلغ بدهکار یا بستانکار باشد", variant: "destructive" });
        return;
      }
    }

    try {
      const entryNumber = `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await createEntryMutation.mutateAsync({
        entryNumber,
        date: new Date(entryDate).toISOString(),
        description: entryDesc.trim(),
        branchId: entryBranchId && entryBranchId !== "all" ? entryBranchId : undefined,
        status: "posted",
        totalDebit,
        totalCredit,
        lines: lines.map((l) => ({
          ...l,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
        })),
      });

      toast({ title: "سند حسابداری دوبل با موفقیت ثبت قطعی شد", description: `شماره سند: ${entryNumber}` });
      setJournalModalOpen(false);
      setEntryDesc("");
      setLines([
        { accountId: "", debit: 0, credit: 0, description: "" },
        { accountId: "", debit: 0, credit: 0, description: "" },
      ]);
    } catch {
      toast({ title: "خطا در ثبت سند حسابداری", variant: "destructive" });
    }
  };

  const entriesList = journalData?.items ?? [];

  // Trial balance totals
  const trialTotals = useMemo(() => {
    return trialBalance.reduce(
      (acc, curr) => ({
        debitTurnover: acc.debitTurnover + curr.turnoverDebit,
        creditTurnover: acc.creditTurnover + curr.turnoverCredit,
        debitClosing: acc.debitClosing + curr.closingDebit,
        creditClosing: acc.creditClosing + curr.closingCredit,
      }),
      { debitTurnover: 0, creditTurnover: 0, debitClosing: 0, creditClosing: 0 }
    );
  }, [trialBalance]);

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> دفتر کل و اسناد دوبل حسابداری
          </h1>
          <p className="text-sm text-muted-foreground">
            مدیریت درخت سرفصل‌ها (Chart of Accounts)، ثبت اسناد دوبل تراز و تراز آزمایشی چهار ستونی
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setJournalModalOpen(true)}>
            <Plus className="h-4 w-4 ml-2" /> ثبت سند دوبل جدید
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="entries">اسناد حسابداری ({entriesList.length})</TabsTrigger>
          <TabsTrigger value="chart">درخت سرفصل‌ها</TabsTrigger>
          <TabsTrigger value="trial">تراز آزمایشی</TabsTrigger>
        </TabsList>

        {/* Tab 1: Journal Entries */}
        <TabsContent value="entries" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در شرح یا شماره سند..."
              className="pr-9"
              value={searchEntry}
              onChange={(e) => setSearchEntry(e.target.value)}
            />
          </div>

          <Card className="border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>شماره سند</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>شرح سند</TableHead>
                    <TableHead>شعبه</TableHead>
                    <TableHead>مجموع بدهکار</TableHead>
                    <TableHead>مجموع بستانکار</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEntriesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="p-4">
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : entriesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        هنوز هیچ سند حسابداری دوبلی ثبت نشده است.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entriesList.map((entry) => {
                      const branch = branches.find((b) => b.id === entry.branchId);
                      return (
                        <TableRow key={entry.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-bold text-primary">{entry.entryNumber}</TableCell>
                          <TableCell className="text-xs">{new Date(entry.date).toLocaleDateString("fa-IR")}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate">{entry.description}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{branch?.name ?? "دفتر مرکزی"}</TableCell>
                          <TableCell className="font-semibold text-sm">{formatCurrency(entry.totalDebit)}</TableCell>
                          <TableCell className="font-semibold text-sm">{formatCurrency(entry.totalCredit)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-success/15 text-success border-success/20">
                              ثبت قطعی
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Chart of Accounts */}
        <TabsContent value="chart" className="space-y-4 mt-4">
          <Card className="border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>کد حساب</TableHead>
                    <TableHead>نام سرفصل</TableHead>
                    <TableHead>سطح حساب</TableHead>
                    <TableHead>ماهیت</TableHead>
                    <TableHead>گردش بدهکار</TableHead>
                    <TableHead>گردش بستانکار</TableHead>
                    <TableHead>مانده حساب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isAccountsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="p-4">
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        سرفصل حسابی در سرور یافت نشد.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-semibold">{acc.code}</TableCell>
                        <TableCell className="font-medium text-sm">
                          <span style={{ paddingRight: `${acc.level === "group" ? 0 : acc.level === "general" ? 16 : acc.level === "subsidiary" ? 32 : 48}px` }}>
                            {acc.name}
                          </span>
                        </TableCell>
                        <TableCell><Badge variant="outline">{levelLabels[acc.level]}</Badge></TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{natureLabels[acc.nature]}</span></TableCell>
                        <TableCell className="text-xs">{formatCurrency(acc.debit || 0)}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(acc.credit || 0)}</TableCell>
                        <TableCell className={`font-bold text-xs ${acc.balance >= 0 ? "text-success" : "text-destructive"}`}>
                          {formatCurrency(Math.abs(acc.balance || 0))} {acc.balance >= 0 ? "(بد)" : "(بس)"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Trial Balance */}
        <TabsContent value="trial" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">بررسی توازن دفتر کل (Debit/Credit Equilibrium)</span>
            </div>
            {trialTotals.debitTurnover === trialTotals.creditTurnover ? (
              <Badge variant="outline" className="bg-success/15 text-success border-success/20 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> تراز آزمایشی متوازن است
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/20 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> عدم توازن در دفاتر
              </Badge>
            )}
          </div>

          <Card className="border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>کد حساب</TableHead>
                    <TableHead>نام حساب</TableHead>
                    <TableHead>گردش بدهکار</TableHead>
                    <TableHead>گردش بستانکار</TableHead>
                    <TableHead>مانده بدهکار</TableHead>
                    <TableHead>مانده بستانکار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTrialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="p-4">
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : trialBalance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        اطلاعات تراز آزمایشی در دسترس نیست.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trialBalance.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-semibold">{item.accountCode}</TableCell>
                        <TableCell className="text-sm font-medium">{item.accountName}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(item.turnoverDebit)}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(item.turnoverCredit)}</TableCell>
                        <TableCell className="text-xs font-semibold text-primary">
                          {item.closingDebit > 0 ? formatCurrency(item.closingDebit) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-primary">
                          {item.closingCredit > 0 ? formatCurrency(item.closingCredit) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {trialBalance.length > 0 && (
                    <TableRow className="bg-muted/60 font-bold">
                      <TableCell colSpan={2}>مجموع تراز آزمایشی</TableCell>
                      <TableCell>{formatCurrency(trialTotals.debitTurnover)}</TableCell>
                      <TableCell>{formatCurrency(trialTotals.creditTurnover)}</TableCell>
                      <TableCell>{formatCurrency(trialTotals.debitClosing)}</TableCell>
                      <TableCell>{formatCurrency(trialTotals.creditClosing)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Double-Entry Creation Dialog */}
      <Dialog open={journalModalOpen} onOpenChange={setJournalModalOpen}>
        <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> صدور سند حسابداری دوبل (Double-Entry Journal Entry)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="entry-date">تاریخ سند</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>شعبه مربوطه</Label>
                <Select value={entryBranchId} onValueChange={setEntryBranchId}>
                  <SelectTrigger><SelectValue placeholder="دفتر مرکزی (عمومی)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">دفتر مرکزی</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="entry-desc">شرح سند <span className="text-destructive">*</span></Label>
                <Input
                  id="entry-desc"
                  placeholder="مثال: بستن حساب‌های موقت / تسویه نقدی"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line items table */}
            <div className="border rounded-xl p-3 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> آرتیکل‌های سند (حداقل ۲ سطر)
                </span>
                <Button size="sm" variant="outline" onClick={addLine}>
                  <Plus className="h-3.5 w-3.5 ml-1" /> افزودن سطر
                </Button>
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 rounded-lg bg-card items-center border">
                    <div className="md:col-span-3">
                      <Label className="text-xs mb-1 block">حساب کل/معین</Label>
                      <Select
                        value={line.accountId}
                        onValueChange={(val) => {
                          const acc = accounts.find((a) => a.id === val);
                          updateLine(idx, {
                            accountId: val,
                            accountCode: acc?.code,
                            accountName: acc?.name,
                          });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="انتخاب حساب..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.code} - {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1 block">مرکز هزینه</Label>
                      <Select
                        value={line.costCenterId || "none"}
                        onValueChange={(val) => updateLine(idx, { costCenterId: val === "none" ? undefined : val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="مرکز هزینه" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">ندارد</SelectItem>
                          {costCenters.map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1 block">بدهکار (ریال)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        placeholder="0"
                        value={line.debit || ""}
                        onChange={(e) => updateLine(idx, { debit: Number(e.target.value) || 0, credit: 0 })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1 block">بستانکار (ریال)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        placeholder="0"
                        value={line.credit || ""}
                        onChange={(e) => updateLine(idx, { credit: Number(e.target.value) || 0, debit: 0 })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1 block">شرح ردیف</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="توضیح..."
                        value={line.description || ""}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeLine(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Equilibrium Footer */}
              <div className="p-3 rounded-lg border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <div>
                    <span className="text-muted-foreground ml-2">جمع بدهکار:</span>
                    <span className="font-bold">{formatCurrency(totalDebit)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground ml-2">جمع بستانکار:</span>
                    <span className="font-bold">{formatCurrency(totalCredit)}</span>
                  </div>
                </div>

                <div>
                  {isBalanced ? (
                    <div className="flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> سند کاملاً تراز است
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-destructive font-semibold">
                      <AlertTriangle className="h-4 w-4" /> اختلاف تراز: {formatCurrency(balanceDiff)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setJournalModalOpen(false)}>
              انصراف
            </Button>
            <Button
              disabled={!isBalanced || createEntryMutation.isPending}
              onClick={handleCreateEntry}
            >
              {createEntryMutation.isPending ? "در حال ثبت سند..." : "ثبت و صدور سند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
