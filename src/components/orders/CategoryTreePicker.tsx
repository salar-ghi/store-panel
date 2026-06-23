import { useEffect, useMemo, useState } from 'react';
import { Category } from '@/types/category';
import { buildCategoryTree, CategoryNode } from '@/lib/category-tree';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  Star,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryTreePickerProps {
  categories: Category[];
  /** Currently selected category id, or 0 / null for "all". */
  value: number | null;
  onChange: (id: number | null) => void;
  /** Optional per-category counts (e.g. product counts). */
  counts?: Record<number, number>;
}

const PIN_STORAGE_KEY = 'order-favorite-categories';
const MAX_PINS = 6;

function getPins(): number[] {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}
function savePins(pins: number[]) {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins.slice(0, MAX_PINS)));
  } catch {
    /* ignore */
  }
}

/**
 * Fast category tree picker. Optimised for hundreds of nodes:
 *   • Sticky search auto-expands ancestors of matches.
 *   • Pinned favorites at the top (persisted to localStorage).
 *   • Click-to-collapse, click-to-select.
 */
export function CategoryTreePicker({
  categories,
  value,
  onChange,
  counts,
}: CategoryTreePickerProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [pins, setPins] = useState<number[]>(() => getPins());

  // Match set when searching: include matching node + all ancestors so they
  // remain visible/expanded in the tree.
  const matchInfo = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const matchIds = new Set<number>();
    const ancestorIds = new Set<number>();
    const visit = (node: CategoryNode, ancestors: number[]) => {
      const hit = node.name.toLowerCase().includes(q);
      if (hit) {
        matchIds.add(node.id);
        ancestors.forEach((a) => ancestorIds.add(a));
      }
      node.children.forEach((c) => visit(c, [...ancestors, node.id]));
    };
    tree.forEach((r) => visit(r, []));
    return { matchIds, ancestorIds };
  }, [search, tree]);

  // Auto-expand ancestors of matches.
  useEffect(() => {
    if (matchInfo) {
      setExpanded((prev) => {
        const next = new Set(prev);
        matchInfo.ancestorIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [matchInfo]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePin = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPins((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [id, ...prev].slice(0, MAX_PINS);
      savePins(next);
      return next;
    });
  };

  const handleSelect = (id: number | null) => {
    onChange(id);
    // Promote selection in pins (recently used).
    if (id != null) {
      setPins((prev) => {
        if (prev.includes(id)) return prev;
        const next = [id, ...prev].slice(0, MAX_PINS);
        savePins(next);
        return next;
      });
    }
  };

  const renderNode = (node: CategoryNode) => {
    if (matchInfo && !matchInfo.matchIds.has(node.id) && !matchInfo.ancestorIds.has(node.id)) {
      return null;
    }
    const isOpen = expanded.has(node.id) || (matchInfo && matchInfo.ancestorIds.has(node.id));
    const isSelected = value === node.id;
    const isPinned = pins.includes(node.id);
    const count = counts?.[node.id];
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={cn(
            'group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors',
            isSelected
              ? 'bg-primary/15 font-semibold text-primary'
              : 'hover:bg-muted',
          )}
          style={{ paddingInlineStart: `${node.depth * 12 + 8}px` }}
          onClick={() => handleSelect(node.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              className="-mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-foreground/10"
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.id);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span className="flex-1 truncate">{node.name}</span>
          {count != null && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] tabular-nums"
            >
              {count}
            </Badge>
          )}
          <button
            type="button"
            className={cn(
              'opacity-0 transition-opacity group-hover:opacity-100',
              isPinned && 'opacity-100',
            )}
            onClick={(e) => togglePin(node.id, e)}
            title={isPinned ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <Star
              className={cn(
                'h-3.5 w-3.5',
                isPinned ? 'fill-warning text-warning' : 'text-muted-foreground',
              )}
            />
          </button>
        </div>
        {isOpen && hasChildren && (
          <div>{node.children.map(renderNode)}</div>
        )}
      </div>
    );
  };

  const pinnedCategories = pins
    .map((id) => byId.get(id))
    .filter((c): c is Category => !!c);

  return (
    <div className="flex h-full flex-col gap-2 rounded-lg border bg-card">
      <div className="sticky top-0 z-10 space-y-2 border-b bg-card p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            dir="rtl"
            className="h-8 pr-8 text-sm"
            placeholder="جستجوی دسته‌بندی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors',
            value == null
              ? 'bg-primary/15 font-semibold text-primary'
              : 'hover:bg-muted',
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          همه دسته‌بندی‌ها
        </button>
      </div>

      {pinnedCategories.length > 0 && !search.trim() && (
        <div className="border-b px-2 pb-2">
          <p className="mb-1 flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            علاقه‌مندی‌ها
          </p>
          <div className="flex flex-wrap gap-1">
            {pinnedCategories.map((c) => (
              <Badge
                key={c.id}
                variant={value === c.id ? 'default' : 'secondary'}
                className="cursor-pointer gap-1 text-[11px]"
                onClick={() => handleSelect(c.id)}
              >
                {c.name}
                <X
                  className="h-3 w-3 opacity-60 hover:opacity-100"
                  onClick={(e) => togglePin(c.id, e)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-1 pb-2">
        {tree.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">
            دسته‌بندی‌ای یافت نشد
          </p>
        ) : (
          tree.map(renderNode)
        )}
      </ScrollArea>
    </div>
  );
}
