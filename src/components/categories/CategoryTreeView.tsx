import { useMemo, useState } from "react";
import { Category } from "@/types/category";
import { buildCategoryTree, CategoryNode } from "@/lib/category-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  Edit,
  Trash2,
  Package,
  FolderTree,
  Folder,
  FolderOpen,
  Search,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryTreeViewProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => void | Promise<void>;
}

export function CategoryTreeView({
  categories,
  onEditCategory,
  onDeleteCategory,
}: CategoryTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    // Expand roots by default
    return new Set(categories.filter((c) => !c.parentId).map((c) => c.id));
  });
  const [query, setQuery] = useState("");

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Stats
  const stats = useMemo(() => {
    const roots = tree.length;
    let total = 0;
    let maxDepth = 0;
    const walk = (n: CategoryNode) => {
      total += 1;
      maxDepth = Math.max(maxDepth, n.depth + 1);
      n.children.forEach(walk);
    };
    tree.forEach(walk);
    return { roots, total, maxDepth };
  }, [tree]);

  // Filtered tree by query (matches anywhere; auto-expands ancestors)
  const filteredTree = useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.trim().toLowerCase();
    const match = (n: CategoryNode): CategoryNode | null => {
      const kids = n.children.map(match).filter(Boolean) as CategoryNode[];
      const self = n.name.toLowerCase().includes(q);
      if (self || kids.length) {
        return { ...n, children: kids };
      }
      return null;
    };
    return tree.map(match).filter(Boolean) as CategoryNode[];
  }, [tree, query]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const expandAll = () => {
    const all = new Set<number>();
    const walk = (n: CategoryNode) => {
      all.add(n.id);
      n.children.forEach(walk);
    };
    tree.forEach(walk);
    setExpanded(all);
  };

  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl border bg-card p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در دسته‌بندی‌ها..."
            className="pr-9"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            {stats.total} دسته
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
            <FolderTree className="h-3.5 w-3.5" />
            {stats.roots} گروه اصلی
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
            {stats.maxDepth} سطح
          </span>
          <div className="hidden md:flex items-center gap-1 ms-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={expandAll}
            >
              باز کردن همه
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={collapseAll}
            >
              بستن همه
            </Button>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {filteredTree.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            موردی یافت نشد
          </div>
        ) : (
          <ul className="divide-y">
            {filteredTree.map((node) => (
              <CategoryTreeNode
                key={node.id}
                node={node}
                expanded={expanded}
                onToggle={toggle}
                onEdit={onEditCategory}
                onDelete={onDeleteCategory}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CategoryTreeNode({
  node,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  node: CategoryNode;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (c: Category) => void;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const depth = node.depth;

  const depthColors = [
    "bg-primary/10 text-primary border-primary/20",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ];
  const chipClass = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <li>
      <div
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors",
          depth === 0 && "bg-muted/20"
        )}
      >
        {/* Indentation guides */}
        {depth > 0 && (
          <div
            className="flex items-stretch shrink-0"
            style={{ width: `${depth * 20}px` }}
            aria-hidden
          >
            {Array.from({ length: depth }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-5 border-s border-dashed border-border/60",
                  i === depth - 1 && "relative"
                )}
              >
                {i === depth - 1 && (
                  <span className="absolute right-0 top-1/2 w-3 border-t border-dashed border-border/60" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          className={cn(
            "h-6 w-6 shrink-0 rounded-md flex items-center justify-center transition-colors",
            hasChildren
              ? "hover:bg-muted text-foreground"
              : "opacity-30 cursor-default"
          )}
          aria-label={isOpen ? "بستن" : "باز کردن"}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          )}
        </button>

        {/* Icon / image */}
        <div className="shrink-0">
          {node.image ? (
            <img
              src={node.image}
              alt=""
              className="h-9 w-9 rounded-lg object-cover border"
            />
          ) : (
            <div
              className={cn(
                "h-9 w-9 rounded-lg border flex items-center justify-center",
                chipClass
              )}
            >
              {hasChildren ? (
                isOpen ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )
              ) : (
                <Package className="h-4 w-4" />
              )}
            </div>
          )}
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "truncate",
                depth === 0 ? "font-semibold text-base" : "font-medium text-sm"
              )}
            >
              {node.name}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                chipClass
              )}
            >
              سطح {depth + 1}
            </span>
            {hasChildren && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {node.children.length} زیرشاخه
              </span>
            )}
            {typeof node.productCount === "number" && node.productCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <Package className="h-2.5 w-2.5" />
                {node.productCount}
              </span>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {node.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onEdit(node)}
          >
            <Edit className="h-3.5 w-3.5 ml-1" />
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <CategoryTreeNode
                key={child.id}
                node={child}
                expanded={expanded}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
