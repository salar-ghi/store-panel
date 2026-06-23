import { useMemo, useState } from 'react';
import { Brand } from '@/types/brand';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandChipsProps {
  brands: Brand[];
  /** Optional category filter — show only brands tied to this category. */
  filterCategoryId?: number | null;
  /** Selected brand ids. Empty = no filter. */
  value: number[];
  onChange: (ids: number[]) => void;
}

export function BrandChips({
  brands,
  filterCategoryId,
  value,
  onChange,
}: BrandChipsProps) {
  const [search, setSearch] = useState('');

  const scoped = useMemo(() => {
    if (!filterCategoryId) return brands;
    return brands.filter((b) => b.categoryIds?.includes(filterCategoryId));
  }, [brands, filterCategoryId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((b) => b.name.toLowerCase().includes(q));
  }, [scoped, search]);

  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          برند ({scoped.length})
        </p>
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <button
              type="button"
              className="text-[11px] text-primary hover:underline"
              onClick={() => onChange([])}
            >
              پاک کردن
            </button>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              dir="rtl"
              className="h-7 w-44 pr-7 text-xs"
              placeholder="جستجوی برند..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">
          برندی برای این دسته یافت نشد
        </p>
      ) : (
        <div className="flex max-h-[88px] flex-wrap gap-1.5 overflow-y-auto">
          {visible.map((b) => {
            const selected = value.includes(b.id);
            return (
              <Badge
                key={b.id}
                variant={selected ? 'default' : 'outline'}
                onClick={() => toggle(b.id)}
                className={cn(
                  'cursor-pointer transition-all',
                  selected && 'shadow-sm',
                )}
              >
                {b.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
