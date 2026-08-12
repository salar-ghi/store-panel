import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  GitCompare,
  Layers,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { AttributeService } from "@/services/attribute-service";
import { CategoryService } from "@/services/category-service";
import {
  ATTRIBUTE_DATA_TYPES,
  AttributeDataType,
  AttributeOption,
  CreateAttributeDefinitionRequest,
} from "@/types/attribute";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function CategoryAttributesDialog({ open, onOpenChange, category }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
    enabled: open,
  });

  const { data: definitions = [], isLoading: loadingDefs } = useQuery({
    queryKey: ["attribute-definitions"],
    queryFn: AttributeService.getAll,
    enabled: open,
  });

  const { data: resolved = [], isLoading: loadingResolved } = useQuery({
    queryKey: ["category-attributes", category?.id],
    queryFn: () => AttributeService.resolveCategoryAttributes(category!.id, categories),
    enabled: open && !!category && categories.length > 0,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["category-attributes"] });
    queryClient.invalidateQueries({ queryKey: ["attribute-definitions"] });
  };

  const assignMutation = useMutation({
    mutationFn: (attributeDefinitionId: number) =>
      AttributeService.assignCategoryAttribute(category!.id, {
        attributeDefinitionId,
        isRequired: false,
        isFilterable: true,
        isVisibleOnProductPage: true,
        sortOrder: resolved.length,
      }),
    onSuccess: () => {
      toast.success("ویژگی به دسته‌بندی اضافه شد");
      invalidate();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "خطا در افزودن ویژگی به دسته‌بندی"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, boolean> }) =>
      AttributeService.updateCategoryAttribute(category!.id, id, data),
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.response?.data?.message || "خطا در بروزرسانی ویژگی"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => AttributeService.removeCategoryAttribute(category!.id, id),
    onSuccess: () => {
      toast.success("ویژگی از دسته‌بندی حذف شد");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "خطا در حذف ویژگی"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAttributeDefinitionRequest) => {
      const created = await AttributeService.create(data);
      if (category && created?.id) {
        await AttributeService.assignCategoryAttribute(category.id, {
          attributeDefinitionId: created.id,
          isRequired: data.isRequired,
          isFilterable: data.isFilterable,
          isVisibleOnProductPage: true,
          sortOrder: resolved.length,
        });
      }
      return created;
    },
    onSuccess: () => {
      toast.success("ویژگی جدید ساخته و به دسته‌بندی متصل شد");
      setShowCreate(false);
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "خطا در ساخت ویژگی"),
  });

  const assignedIds = useMemo(
    () => new Set(resolved.map((r) => r.attributeDefinitionId)),
    [resolved]
  );

  const available = useMemo(
    () =>
      definitions
        .filter((d) => !assignedIds.has(d.id))
        .filter((d) =>
          !search.trim()
            ? true
            : `${d.name} ${d.code}`.toLowerCase().includes(search.trim().toLowerCase())
        ),
    [definitions, assignedIds, search]
  );

  const own = resolved.filter((r) => !r.inheritedFrom);
  const inherited = resolved.filter((r) => r.inheritedFrom);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[86vh] overflow-y-auto text-xs" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-primary" />
            ویژگی‌های دسته‌بندی «{category?.name}»
          </DialogTitle>
          <DialogDescription className="text-[11px] leading-5">
            ویژگی‌هایی که هنگام ثبت محصول در این دسته‌بندی پرسیده می‌شوند. ویژگی‌های
            دسته‌بندی‌های والد به‌صورت خودکار به ارث می‌رسند.
          </DialogDescription>
        </DialogHeader>

        {loadingResolved || loadingDefs ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Inherited */}
            {inherited.length > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  ارث‌بری شده از والدها ({inherited.length})
                </h4>
                <div className="rounded-lg border divide-y bg-muted/20">
                  {inherited.map((r) => (
                    <div key={r.attributeDefinitionId} className="flex items-center gap-2 px-3 py-2">
                      <span className="text-[13px] font-medium">{r.attributeDefinition.name}</span>
                      <code className="text-[10px] text-muted-foreground">
                        {r.attributeDefinition.code}
                      </code>
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        {r.inheritedFrom?.name}
                      </Badge>
                      <FlagIcons
                        filterable={r.isFilterable ?? r.attributeDefinition.isFilterable}
                        searchable={r.attributeDefinition.isSearchable}
                        comparable={r.attributeDefinition.isComparable}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Own attributes */}
            <section className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                ویژگی‌های این دسته‌بندی ({own.length})
              </h4>
              {own.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed py-7 text-center text-xs text-muted-foreground">
                  هنوز ویژگی‌ای برای این دسته‌بندی تعریف نشده است
                </div>
              ) : (
                <div className="rounded-lg border divide-y">
                  {own.map((r) => (
                    <div key={r.id} className="px-2.5 py-2 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium">{r.attributeDefinition.name}</span>
                        <code className="text-[10px] text-muted-foreground/70" dir="ltr">
                          {r.attributeDefinition.code}
                        </code>
                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                          {ATTRIBUTE_DATA_TYPES.find(
                            (t) => t.value === r.attributeDefinition.dataType
                          )?.label ?? r.attributeDefinition.dataType}
                        </Badge>
                        {r.attributeDefinition.unit && (
                          <span className="text-[10px] text-muted-foreground">
                            واحد: {r.attributeDefinition.unit}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 me-auto text-destructive hover:bg-destructive/10"
                          onClick={() => removeMutation.mutate(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ToggleFlag
                          label="اجباری"
                          checked={r.isRequired}
                          onChange={(v) =>
                            updateMutation.mutate({ id: r.id, data: { isRequired: v } })
                          }
                        />
                        <ToggleFlag
                          label="قابل فیلتر"
                          checked={r.isFilterable}
                          onChange={(v) =>
                            updateMutation.mutate({ id: r.id, data: { isFilterable: v } })
                          }
                        />
                        <ToggleFlag
                          label="نمایش در محصول"
                          checked={r.isVisibleOnProductPage}
                          onChange={(v) =>
                            updateMutation.mutate({
                              id: r.id,
                              data: { isVisibleOnProductPage: v },
                            })
                          }
                        />
                        <FlagIcons
                          filterable={r.isFilterable}
                          searchable={r.attributeDefinition.isSearchable}
                          comparable={r.attributeDefinition.isComparable}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Attach existing */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  افزودن ویژگی موجود
                </h4>
                <Button
                  size="sm"
                  variant={showCreate ? "secondary" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setShowCreate((s) => !s)}
                >
                  {showCreate ? (
                    <>
                      <X className="h-3.5 w-3.5 ml-1" />
                      انصراف
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 ml-1" />
                      ساخت ویژگی جدید
                    </>
                  )}
                </Button>
              </div>

              {showCreate ? (
                <AttributeDefinitionForm
                  submitting={createMutation.isPending}
                  onSubmit={(d) => createMutation.mutate(d)}
                />
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="جستجوی ویژگی..."
                      className="h-8 pr-8 text-xs"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                    {available.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        ویژگی دیگری برای افزودن وجود ندارد
                      </p>
                    ) : (
                      available.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => assignMutation.mutate(d.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-right hover:bg-muted/50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-[13px]">{d.name}</span>
                          <code className="text-[10px] text-muted-foreground">{d.code}</code>
                          <Badge variant="secondary" className="h-4 px-1 text-[10px] me-auto">
                            {ATTRIBUTE_DATA_TYPES.find((t) => t.value === d.dataType)?.label ??
                              d.dataType}
                          </Badge>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ToggleFlag({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

function FlagIcons({
  filterable,
  searchable,
  comparable,
}: {
  filterable?: boolean;
  searchable?: boolean;
  comparable?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {filterable && <Filter className="h-3 w-3" />}
      {searchable && <Search className="h-3 w-3" />}
      {comparable && <GitCompare className="h-3 w-3" />}
    </span>
  );
}

function AttributeDefinitionForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (d: CreateAttributeDefinitionRequest) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dataType, setDataType] = useState<AttributeDataType>("String");
  const [unit, setUnit] = useState("");
  const [isFilterable, setIsFilterable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isComparable, setIsComparable] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [isVariantAttribute, setIsVariantAttribute] = useState(false);
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [optionInput, setOptionInput] = useState("");

  const needsOptions = dataType === "Select" || dataType === "MultiSelect";

  const addOption = () => {
    const v = optionInput.trim();
    if (!v) return;
    setOptions((o) => [...o, { value: v, label: v, sortOrder: o.length, isActive: true }]);
    setOptionInput("");
  };

  const submit = () => {
    if (!name.trim() || !code.trim()) {
      toast.error("نام و کد ویژگی الزامی است");
      return;
    }
    if (needsOptions && options.length === 0) {
      toast.error("برای ویژگی انتخابی حداقل یک گزینه تعریف کنید");
      return;
    }
    onSubmit({
      name: name.trim(),
      code: code.trim(),
      dataType,
      unit: unit.trim() || undefined,
      isFilterable,
      isSearchable,
      isComparable,
      isRequired,
      isVariantAttribute,
      sortOrder: 0,
      options: needsOptions ? options : undefined,
    });
  };

  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-2.5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">نام نمایشی</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!code) {
                // no auto-transliteration; keep code manual for Persian names
              }
            }}
            placeholder="مثال: رم"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">کد یکتا (انگلیسی)</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s+/g, "_").toLowerCase())}
            placeholder="ram"
            dir="ltr"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">نوع داده</Label>
          <Select value={dataType} onValueChange={(v) => setDataType(v as AttributeDataType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTRIBUTE_DATA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">واحد (اختیاری)</Label>
          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="GB / ml / GHz"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">گزینه‌ها</Label>
          <div className="flex gap-2">
            <Input
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              placeholder="مثال: ۸ گیگابایت"
              className="h-8 text-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-8 w-9 shrink-0 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {options.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {options.map((o, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {o.label || o.value}
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <ToggleFlag label="قابل فیلتر" checked={isFilterable} onChange={setIsFilterable} />
        <ToggleFlag label="قابل جستجو" checked={isSearchable} onChange={setIsSearchable} />
        <ToggleFlag label="قابل مقایسه" checked={isComparable} onChange={setIsComparable} />
        <ToggleFlag label="اجباری" checked={isRequired} onChange={setIsRequired} />
        <ToggleFlag
          label="واریانت"
          checked={isVariantAttribute}
          onChange={setIsVariantAttribute}
        />
      </div>

      <Button
        type="button"
        size="sm"
        onClick={submit}
        disabled={submitting}
        className={cn("w-full", submitting && "opacity-70")}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Plus className="h-4 w-4 ml-1" />}
        ساخت و اتصال ویژگی
      </Button>
    </div>
  );
}
