import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { ResolvedCategoryAttribute } from "@/types/attribute";
import { Category } from "@/types/category";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryTreeSelect } from "@/components/categories/CategoryTreeSelect";
import { ChevronDown, Star, Truck, PackageCheck, RotateCcw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/format";
import {
  FacetState, attrTokens, countActive, getProductRating, isExpress, isRangeAttr, matches, slug,
} from "@/lib/product-facets";
import { getProductStock } from "@/data/ordersData";

interface Props {
  products: Product[];
  categories: Category[];
  attrs: ResolvedCategoryAttribute[];
  catIds: Set<number> | null;
  state: FacetState;
  onChange: (s: FacetState) => void;
  onReset: () => void;
  attrsLoading?: boolean;
}

function Section({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-3 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          {title}
          {!!badge && <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">{formatPersianNumber(badge)}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-2.5 space-y-1.5">{children}</div>}
    </div>
  );
}

function OptionRow({ label, count, checked, onToggle }: { label: string; count: number; checked: boolean; onToggle: () => void }) {
  // Zero-count management: disable dead-end options (unless already selected so user can uncheck)
  const disabled = count === 0 && !checked;
  return (
    <label className={cn("flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-muted/60", disabled && "cursor-not-allowed opacity-40 hover:bg-transparent")}>
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={onToggle} className="h-3.5 w-3.5" />
      <span className="flex-1 truncate">{label}</span>
      <span className="text-[10px] tabular-nums text-muted-foreground">{formatPersianNumber(count)}</span>
    </label>
  );
}

export function FacetSidebar({ products, categories, attrs, catIds, state, onChange, onReset, attrsLoading }: Props) {
  const [hideZero, setHideZero] = useState(false);
  const set = (patch: Partial<FacetState>) => onChange({ ...state, ...patch });

  const brandOptions = useMemo(() => {
    const pool = products.filter((p) => matches(p, state, attrs, catIds, "brand"));
    const all = new Map<string, string>();
    products.forEach((p) => p.brandName && all.set(slug(p.brandName), p.brandName));
    return [...all.entries()].map(([key, label]) => ({
      key, label, count: pool.filter((p) => slug(p.brandName) === key).length,
    })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa"));
  }, [products, state, attrs, catIds]);

  const inStockCount = useMemo(() => products.filter((p) => matches(p, state, attrs, catIds, "inStock") && getProductStock(p) > 0).length, [products, state, attrs, catIds]);
  const expressCount = useMemo(() => products.filter((p) => matches(p, state, attrs, catIds, "express") && isExpress(p)).length, [products, state, attrs, catIds]);
  const ratingCounts = useMemo(() => {
    const pool = products.filter((p) => matches(p, state, attrs, catIds, "rating"));
    return [4, 3, 2].map((r) => ({ r, count: pool.filter((p) => getProductRating(p) >= r).length }));
  }, [products, state, attrs, catIds]);

  const dynamicFacets = useMemo(() => attrs
    .filter((a) => (a.isFilterable ?? a.attributeDefinition.isFilterable))
    .map((a) => {
      const code = a.attributeDefinition.code;
      const pool = products.filter((p) => matches(p, state, attrs, catIds, `attr:${code}`));
      const dt = a.attributeDefinition.dataType;
      let options: { key: string; label: string; count: number }[] = [];
      if (dt === "Select" || dt === "MultiSelect") {
        options = (a.attributeDefinition.options ?? []).filter((o) => o.isActive !== false && o.id != null)
          .sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0))
          .map((o) => ({ key: String(o.id), label: o.label || o.value, count: pool.filter((p) => attrTokens(p, a).includes(String(o.id))).length }));
      } else if (dt === "Boolean") {
        options = [["true", "بله"], ["false", "خیر"]].map(([key, label]) => ({ key, label, count: pool.filter((p) => attrTokens(p, a).includes(key)).length }));
      } else if (!isRangeAttr(a)) {
        const labels = new Map<string, string>();
        products.forEach((p) => {
          const v = p.attributeValues?.find((x) => x.attributeDefinitionId === a.attributeDefinitionId);
          const raw = dt === "Date" ? v?.dateValue?.slice(0, 10) : v?.stringValue;
          if (raw) labels.set(dt === "Date" ? raw : slug(raw), raw);
        });
        options = [...labels.entries()].map(([key, label]) => ({ key, label, count: pool.filter((p) => attrTokens(p, a).includes(key)).length }));
      }
      return { a, code, options, poolSize: pool.length };
    }), [attrs, products, state, catIds]);

  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const visible = <T extends { count: number; key: string }>(opts: T[], selected: string[]) =>
    hideZero ? opts.filter((o) => o.count > 0 || selected.includes(o.key)) : opts;

  const active = countActive(state);

  return (
    <aside className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">فیلترها {active > 0 && <span className="text-xs text-muted-foreground">({formatPersianNumber(active)})</span>}</h3>
        {active > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1 px-2 text-xs">
            <RotateCcw className="h-3 w-3" /> پاک‌کردن
          </Button>
        )}
      </div>
      <label className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
        پنهان کردن گزینه‌های بدون نتیجه
        <Switch checked={hideZero} onCheckedChange={setHideZero} className="scale-75" />
      </label>

      <Section title="دسته‌بندی">
        <CategoryTreeSelect
          categories={categories}
          value={state.category ? String(state.category) : "all"}
          noneValue="all"
          noneLabel="همه دسته‌بندی‌ها"
          onChange={(v) => onChange({ ...state, category: v === "all" ? undefined : Number(v), attrs: {}, ranges: {} })}
        />
      </Section>

      <Section title="برند" badge={state.brands.length}>
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {visible(brandOptions, state.brands).map((o) => (
            <OptionRow key={o.key} label={o.label} count={o.count} checked={state.brands.includes(o.key)} onToggle={() => set({ brands: toggleIn(state.brands, o.key) })} />
          ))}
          {brandOptions.length === 0 && <p className="text-xs text-muted-foreground">برندی یافت نشد</p>}
        </div>
      </Section>

      <Section title="محدوده قیمت (تومان)">
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="از" className="h-8 text-xs" value={state.priceMin ?? ""} onChange={(e) => set({ priceMin: e.target.value === "" ? undefined : Number(e.target.value) })} />
          <span className="text-muted-foreground">–</span>
          <Input type="number" placeholder="تا" className="h-8 text-xs" value={state.priceMax ?? ""} onChange={(e) => set({ priceMax: e.target.value === "" ? undefined : Number(e.target.value) })} />
        </div>
      </Section>

      <Section title="وضعیت و ارسال">
        <label className={cn("flex items-center justify-between text-xs", inStockCount === 0 && !state.inStock && "opacity-40")}>
          <span className="flex items-center gap-1.5"><PackageCheck className="h-3.5 w-3.5" /> فقط کالاهای موجود <span className="text-[10px] text-muted-foreground">({formatPersianNumber(inStockCount)})</span></span>
          <Switch checked={state.inStock} disabled={inStockCount === 0 && !state.inStock} onCheckedChange={(v) => set({ inStock: v })} className="scale-75" />
        </label>
        <label className={cn("flex items-center justify-between text-xs", expressCount === 0 && !state.express && "opacity-40")}>
          <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> ارسال سریع <span className="text-[10px] text-muted-foreground">({formatPersianNumber(expressCount)})</span></span>
          <Switch checked={state.express} disabled={expressCount === 0 && !state.express} onCheckedChange={(v) => set({ express: v })} className="scale-75" />
        </label>
      </Section>

      <Section title="امتیاز فروشنده">
        {ratingCounts.filter((o) => !hideZero || o.count > 0 || state.ratingMin === o.r).map(({ r, count }) => (
          <OptionRow key={r} label={`${formatPersianNumber(r)} ستاره و بالاتر`} count={count} checked={state.ratingMin === r}
            onToggle={() => set({ ratingMin: state.ratingMin === r ? undefined : r })} />
        ))}
        <Star className="hidden" />
      </Section>

      {state.category && (
        <div className="mt-2 rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
          <Layers className="ml-1 inline h-3 w-3" />
          ویژگی‌های اختصاصی دسته {attrsLoading && "(در حال بارگذاری...)"}
        </div>
      )}
      {dynamicFacets.map(({ a, code, options }) => {
        const unit = a.attributeDefinition.unit;
        if (isRangeAttr(a)) {
          const r = state.ranges[code] ?? [undefined, undefined];
          const upd = (i: 0 | 1, v: string) => {
            const nr: [number | undefined, number | undefined] = [...r];
            nr[i] = v === "" ? undefined : Number(v);
            set({ ranges: { ...state.ranges, [code]: nr } });
          };
          return (
            <Section key={code} title={`${a.attributeDefinition.name}${unit ? ` (${unit})` : ""}`}>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="از" className="h-8 text-xs" value={r[0] ?? ""} onChange={(e) => upd(0, e.target.value)} />
                <span className="text-muted-foreground">–</span>
                <Input type="number" placeholder="تا" className="h-8 text-xs" value={r[1] ?? ""} onChange={(e) => upd(1, e.target.value)} />
              </div>
            </Section>
          );
        }
        const selected = state.attrs[code] ?? [];
        const opts = visible(options, selected);
        return (
          <Section key={code} title={a.attributeDefinition.name} badge={selected.length}>
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {opts.map((o) => (
                <OptionRow key={o.key} label={`${o.label}${unit ? ` ${unit}` : ""}`} count={o.count} checked={selected.includes(o.key)}
                  onToggle={() => set({ attrs: { ...state.attrs, [code]: toggleIn(selected, o.key) } })} />
              ))}
              {opts.length === 0 && <p className="text-xs text-muted-foreground">مقداری ثبت نشده</p>}
            </div>
          </Section>
        );
      })}
    </aside>
  );
}
