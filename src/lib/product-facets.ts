import { Product } from "@/types/product";
import { ResolvedCategoryAttribute } from "@/types/attribute";
import { Category } from "@/types/category";
import { getProductPrice, getProductStock } from "@/data/ordersData";

/**
 * Faceted search engine for product listings.
 *
 * Two layers:
 *  1. Global (cross-category) facets – hardcoded, present on every product:
 *     brand, price range, in-stock only, express delivery, seller rating.
 *  2. Category-specific dynamic facets – metadata-driven from the category's
 *     attribute definitions (isFilterable + sortOrder), incl. inherited ones.
 *
 * All state is serialised into URL query params so it can be shared/bookmarked.
 */

export interface FacetState {
  q: string;
  category?: number;
  brands: string[];
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  express: boolean;
  ratingMin?: number;
  /** attribute code → selected tokens (option ids, "true"/"false", or text values) */
  attrs: Record<string, string[]>;
  /** attribute code → numeric range for Integer/Decimal */
  ranges: Record<string, [number | undefined, number | undefined]>;
  sort: string;
}

const RESERVED = new Set([
  "q", "category", "brand", "price_min", "price_max", "in_stock", "express", "rating", "sort",
]);

export const emptyFacetState = (): FacetState => ({
  q: "", brands: [], inStock: false, express: false, attrs: {}, ranges: {}, sort: "name_asc",
});

const num = (v: string | null) => {
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function parseFacetState(sp: URLSearchParams): FacetState {
  const s = emptyFacetState();
  s.q = sp.get("q") ?? "";
  s.category = num(sp.get("category"));
  s.brands = (sp.get("brand") ?? "").split(",").filter(Boolean);
  s.priceMin = num(sp.get("price_min"));
  s.priceMax = num(sp.get("price_max"));
  s.inStock = sp.get("in_stock") === "1";
  s.express = sp.get("express") === "1";
  s.ratingMin = num(sp.get("rating"));
  s.sort = sp.get("sort") ?? "name_asc";
  sp.forEach((value, key) => {
    if (RESERVED.has(key)) return;
    if (key.endsWith("_min") || key.endsWith("_max")) {
      const code = key.slice(0, -4);
      const r = s.ranges[code] ?? [undefined, undefined];
      if (key.endsWith("_min")) r[0] = num(value); else r[1] = num(value);
      s.ranges[code] = r;
    } else {
      s.attrs[key] = value.split(",").filter(Boolean);
    }
  });
  return s;
}

export function serializeFacetState(s: FacetState): URLSearchParams {
  const sp = new URLSearchParams();
  if (s.q) sp.set("q", s.q);
  if (s.category) sp.set("category", String(s.category));
  if (s.brands.length) sp.set("brand", s.brands.join(","));
  if (s.priceMin !== undefined) sp.set("price_min", String(s.priceMin));
  if (s.priceMax !== undefined) sp.set("price_max", String(s.priceMax));
  if (s.inStock) sp.set("in_stock", "1");
  if (s.express) sp.set("express", "1");
  if (s.ratingMin) sp.set("rating", String(s.ratingMin));
  for (const [code, vals] of Object.entries(s.attrs)) if (vals.length) sp.set(code, vals.join(","));
  for (const [code, [lo, hi]] of Object.entries(s.ranges)) {
    if (lo !== undefined) sp.set(`${code}_min`, String(lo));
    if (hi !== undefined) sp.set(`${code}_max`, String(hi));
  }
  if (s.sort && s.sort !== "name_asc") sp.set("sort", s.sort);
  return sp;
}

export const slug = (v?: string) => (v ?? "").trim().toLowerCase().replace(/\s+/g, "-");

export function getProductRating(p: Product): number {
  const anyP = p as any;
  return Number(anyP.sellerRating ?? anyP.supplierRating ?? anyP.rating ?? 0) || 0;
}
export function isExpress(p: Product): boolean {
  const anyP = p as any;
  return !!(anyP.isExpressDelivery ?? anyP.fastDelivery ?? anyP.expressFulfillment);
}

/** Tokens a product exposes for an attribute (used for matching and counting). */
export function attrTokens(p: Product, attr: ResolvedCategoryAttribute): string[] {
  const v = p.attributeValues?.find((x) => x.attributeDefinitionId === attr.attributeDefinitionId
    || (x.attributeCode && x.attributeCode === attr.attributeDefinition.code));
  if (!v) return [];
  switch (attr.attributeDefinition.dataType) {
    case "Select": return v.attributeOptionId != null ? [String(v.attributeOptionId)] : [];
    case "MultiSelect": return (v.attributeOptionIds ?? []).map(String);
    case "Boolean": return v.boolValue == null ? [] : [String(v.boolValue)];
    case "Integer": return v.intValue == null ? [] : [String(v.intValue)];
    case "Decimal": return v.decimalValue == null ? [] : [String(v.decimalValue)];
    case "Date": return v.dateValue ? [v.dateValue.slice(0, 10)] : [];
    default: return v.stringValue ? [slug(v.stringValue)] : [];
  }
}

export const isRangeAttr = (a: ResolvedCategoryAttribute) =>
  a.attributeDefinition.dataType === "Integer" || a.attributeDefinition.dataType === "Decimal";

export function descendantIds(rootId: number, categories: Category[]): Set<number> {
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) { ids.add(c.id); grew = true; }
  }
  return ids;
}

type FacetKey = "brand" | "price" | "inStock" | "express" | "rating" | `attr:${string}`;

/** Does the product satisfy every filter except `skip` (used for zero-count computation)? */
export function matches(
  p: Product, s: FacetState, attrs: ResolvedCategoryAttribute[], catIds: Set<number> | null, skip?: FacetKey,
): boolean {
  if (s.q) {
    const q = s.q.toLowerCase();
    const searchableHit = attrs.some((a) => a.attributeDefinition.isSearchable &&
      p.attributeValues?.some((v) => v.attributeDefinitionId === a.attributeDefinitionId &&
        (v.stringValue ?? "").toLowerCase().includes(q)));
    if (!(p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      || (p as any).sku?.toLowerCase?.().includes(q) || searchableHit)) return false;
  }
  if (catIds && !catIds.has(p.categoryId)) return false;
  if (skip !== "brand" && s.brands.length && !s.brands.includes(slug(p.brandName))) return false;
  if (skip !== "price") {
    const price = getProductPrice(p);
    if (s.priceMin !== undefined && price < s.priceMin) return false;
    if (s.priceMax !== undefined && price > s.priceMax) return false;
  }
  if (skip !== "inStock" && s.inStock && getProductStock(p) <= 0) return false;
  if (skip !== "express" && s.express && !isExpress(p)) return false;
  if (skip !== "rating" && s.ratingMin && getProductRating(p) < s.ratingMin) return false;
  for (const a of attrs) {
    const code = a.attributeDefinition.code;
    if (skip === `attr:${code}`) continue;
    if (isRangeAttr(a)) {
      const r = s.ranges[code];
      if (r && (r[0] !== undefined || r[1] !== undefined)) {
        const t = attrTokens(p, a)[0];
        if (t === undefined) return false;
        const n = Number(t);
        if (r[0] !== undefined && n < r[0]) return false;
        if (r[1] !== undefined && n > r[1]) return false;
      }
    } else {
      const sel = s.attrs[code];
      if (sel?.length) {
        const toks = attrTokens(p, a);
        if (!sel.some((x) => toks.includes(x))) return false; // OR within a facet
      }
    }
  }
  return true;
}

export function sortProducts(list: Product[], sort: string): Product[] {
  const [field, dir] = sort.split("_");
  const m = dir === "desc" ? -1 : 1;
  return [...list].sort((a, b) => {
    if (field === "price") return (getProductPrice(a) - getProductPrice(b)) * m;
    if (field === "stock") return (getProductStock(a) - getProductStock(b)) * m;
    if (field === "rating") return (getProductRating(a) - getProductRating(b)) * m;
    return a.name.localeCompare(b.name, "fa") * m;
  });
}

export function countActive(s: FacetState): number {
  return s.brands.length + (s.priceMin !== undefined || s.priceMax !== undefined ? 1 : 0)
    + (s.inStock ? 1 : 0) + (s.express ? 1 : 0) + (s.ratingMin ? 1 : 0)
    + Object.values(s.attrs).reduce((n, v) => n + v.length, 0)
    + Object.values(s.ranges).filter(([a, b]) => a !== undefined || b !== undefined).length;
}
