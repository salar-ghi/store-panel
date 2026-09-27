import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { ProductService } from "@/services/product-service";
import { CategoryService } from "@/services/category-service";
import { AttributeService } from "@/services/attribute-service";
import { Product } from "@/types/product";
import { SearchBar } from "./SearchBar";
import { ProductTable } from "./ProductTable";
import { EmptyProductList } from "./EmptyProductList";
import { FacetSidebar } from "./FacetSidebar";
import { formatPersianNumber } from "@/lib/format";
import {
  FacetState, countActive, descendantIds, emptyFacetState, matches, parseFacetState, serializeFacetState, sortProducts,
} from "@/lib/product-facets";

interface ProductListProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onViewProduct: (product: Product) => void;
}

export function ProductList({ onViewProduct }: ProductListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseFacetState(searchParams), [searchParams]);
  const update = (s: FacetState) => setSearchParams(serializeFacetState(s), { replace: true });

  const { isLoading, data: products = [], error, refetch } = useQuery({ queryKey: ["products"], queryFn: ProductService.getAll });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: CategoryService.getAllCategories });
  const { data: attrs = [], isFetching: attrsLoading } = useQuery({
    queryKey: ["category-facets", state.category, categories.length],
    queryFn: () => AttributeService.resolveCategoryAttributes(state.category!, categories),
    enabled: !!state.category && categories.length > 0,
  });
  const activeAttrs = state.category ? attrs : [];

  const catIds = useMemo(() => (state.category ? descendantIds(state.category, categories) : null), [state.category, categories]);
  const results = useMemo(
    () => sortProducts(products.filter((p) => matches(p, state, activeAttrs, catIds)), state.sort),
    [products, state, activeAttrs, catIds],
  );

  const chips: { label: string; clear: () => void }[] = [];
  state.brands.forEach((b) => chips.push({ label: `برند: ${products.find((p) => (p.brandName ?? "").trim().toLowerCase().replace(/\s+/g, "-") === b)?.brandName ?? b}`, clear: () => update({ ...state, brands: state.brands.filter((x) => x !== b) }) }));
  if (state.priceMin !== undefined || state.priceMax !== undefined) chips.push({ label: `قیمت: ${formatPersianNumber(state.priceMin ?? 0)} تا ${state.priceMax !== undefined ? formatPersianNumber(state.priceMax) : "∞"}`, clear: () => update({ ...state, priceMin: undefined, priceMax: undefined }) });
  if (state.inStock) chips.push({ label: "فقط موجود", clear: () => update({ ...state, inStock: false }) });
  if (state.express) chips.push({ label: "ارسال سریع", clear: () => update({ ...state, express: false }) });
  if (state.ratingMin) chips.push({ label: `امتیاز ${formatPersianNumber(state.ratingMin)}+`, clear: () => update({ ...state, ratingMin: undefined }) });
  for (const a of activeAttrs) {
    const code = a.attributeDefinition.code;
    (state.attrs[code] ?? []).forEach((v) => {
      const opt = a.attributeDefinition.options?.find((o) => String(o.id) === v);
      const label = opt ? opt.label || opt.value : v === "true" ? "بله" : v === "false" ? "خیر" : v;
      chips.push({ label: `${a.attributeDefinition.name}: ${label}`, clear: () => update({ ...state, attrs: { ...state.attrs, [code]: state.attrs[code].filter((x) => x !== v) } }) });
    });
    const r = state.ranges[code];
    if (r && (r[0] !== undefined || r[1] !== undefined)) {
      chips.push({ label: `${a.attributeDefinition.name}: ${r[0] ?? "…"}–${r[1] ?? "…"}`, clear: () => { const nr = { ...state.ranges }; delete nr[code]; update({ ...state, ranges: nr }); } });
    }
  }

  const reset = () => update({ ...emptyFacetState(), q: state.q, category: state.category });

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-center">
        <div>
          <p className="text-lg font-medium text-destructive">خطا در بارگیری محصولات</p>
          <p className="mt-2 text-muted-foreground">لطفا اتصال به سرور را بررسی کنید</p>
          <Button className="mt-4" onClick={() => refetch()}>تلاش مجدد</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="lg:sticky lg:top-4 lg:self-start">
        <FacetSidebar
          products={products}
          categories={categories}
          attrs={activeAttrs}
          catIds={catIds}
          state={state}
          onChange={update}
          onReset={reset}
          attrsLoading={attrsLoading}
        />
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1"><SearchBar value={state.q} onChange={(q) => update({ ...state, q })} /></div>
          <Select value={state.sort} onValueChange={(sort) => update({ ...state, sort })}>
            <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">نام (الف-ی)</SelectItem>
              <SelectItem value="name_desc">نام (ی-الف)</SelectItem>
              <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
              <SelectItem value="price_desc">گران‌ترین</SelectItem>
              <SelectItem value="stock_desc">بیشترین موجودی</SelectItem>
              <SelectItem value="rating_desc">بالاترین امتیاز</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1 text-xs" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("لینک فیلترها کپی شد"); }}>
            <Link2 className="h-3.5 w-3.5" /> اشتراک
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>{formatPersianNumber(results.length)} محصول</span>
          {chips.map((c, i) => (
            <Badge key={i} variant="secondary" className="gap-1 font-normal">
              {c.label}
              <button onClick={c.clear} aria-label="حذف فیلتر"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {countActive(state) > 0 && <button onClick={reset} className="text-primary hover:underline">پاک‌کردن همه</button>}
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center text-muted-foreground">در حال بارگیری محصولات...</div>
        ) : results.length === 0 ? (
          <EmptyProductList searchQuery={state.q} hasFilters={countActive(state) > 0} onResetFilters={reset} />
        ) : (
          <ProductTable products={results} onViewProduct={onViewProduct} />
        )}
      </div>
    </div>
  );
}
