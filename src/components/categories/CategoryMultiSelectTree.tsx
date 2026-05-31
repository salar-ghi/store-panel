import { useMemo, useState } from "react";
import { Category } from "@/types/category";
import { buildCategoryTree, CategoryNode } from "@/lib/category-tree";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronLeft,
  Folder,
  FolderOpen,
  Package,
  Search,
  X,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryMultiSelectTreeProps {
  categories: Category[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  emptyText?: string;
}

/**
 * A clean, hierarchical multi-select for categories.
 * Designed for brand <-> categories assignment.
 */
export function CategoryMultiSelectTree({
  categories,
  selectedIds,
  onChange,
  emptyText = "دسته‌بندی‌ای موجود نیست",
}: CategoryMultiSelectTreeProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(categories.filter((c) => !c.parentId).map((c) => c.id))
  );

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredTree = useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.trim().toLowerCase();
    const match = (n: CategoryNode): CategoryNode | null => {
      const kids = n.children.map(match).filter(Boolean) as CategoryNode[];
      if (n.name.toLowerCase().includes(q) || kids.length) {
        return { ...n, children: kids };
      }
      return null;
    };
    return tree.map(match).filter(Boolean) as CategoryNode[];
  }, [tree, query]);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelect = (id: number) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );

  const breadcrumb = (id: number) => {
    const parts: string[] = [];
    let cur = categoryMap.get(id);
    const seen = new Set<number>();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      parts.unshift(cur.name);
      cur = cur.parentId ? categoryMap.get(cur.parentId) : undefined;
    }
    return parts.join(" › ");
  };

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="border-b bg-muted/30 px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => toggleSelect(id)}
              >
                <span className="text-[11px]">{breadcrumb(id)}</span>
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative border-b">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی دسته‌بندی..."
          className="border-0 rounded-none pr-9 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 bg-transparent"
        />
      </div>

      {/* Tree */}
      <ScrollArea className="h-56" dir="rtl">
        {filteredTree.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {query ? "موردی یافت نشد" : emptyText}
          </div>
        ) : (
          <ul className="py-1">
            {filteredTree.map((node) => (
              <MSNode
                key={node.id}
                node={node}
                selectedIds={selectedIds}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onToggleSelect={toggleSelect}
              />
            ))}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <FolderTree className="h-3 w-3" />
          ساختار سلسله‌مراتبی
        </span>
        <span>{selectedIds.length} انتخاب شده</span>
      </div>
    </div>
  );
}

function MSNode({
  node,
  selectedIds,
  expanded,
  onToggleExpand,
  onToggleSelect,
}: {
  node: CategoryNode;
  selectedIds: number[];
  expanded: Set<number>;
  onToggleExpand: (id: number) => void;
  onToggleSelect: (id: number) => void;
}) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedIds.includes(node.id);
  const depth = node.depth;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 mx-1 rounded-md transition-colors",
          isSelected ? "bg-primary/10" : "hover:bg-muted/60"
        )}
        style={{ paddingInlineStart: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={cn(
            "h-5 w-5 shrink-0 rounded flex items-center justify-center",
            hasChildren ? "hover:bg-muted" : "opacity-30 cursor-default"
          )}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          )}
        </button>

        <Checkbox
          id={`cat-ms-${node.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(node.id)}
        />

        <label
          htmlFor={`cat-ms-${node.id}`}
          className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer"
        >
          {hasChildren ? (
            isOpen ? (
              <FolderOpen className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            )
          ) : (
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <span
            className={cn(
              "truncate text-sm",
              depth === 0 ? "font-semibold" : "font-normal",
              depth > 1 && "text-muted-foreground"
            )}
          >
            {node.name}
          </span>
        </label>
      </div>

      {hasChildren && isOpen && (
        <ul>
          {node.children.map((child) => (
            <MSNode
              key={child.id}
              node={child}
              selectedIds={selectedIds}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
