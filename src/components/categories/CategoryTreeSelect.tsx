import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category";
import { flattenCategoryTree } from "@/lib/category-tree";
import { CornerDownLeft, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTreeSelectProps {
  categories: Category[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Categories to exclude (e.g. self when editing parent). */
  excludeIds?: number[];
  /** Value to use for the "no selection" item. Pass undefined to hide. */
  noneValue?: string;
  noneLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function CategoryTreeSelect({
  categories,
  value,
  onChange,
  placeholder = "انتخاب دسته‌بندی",
  excludeIds = [],
  noneValue,
  noneLabel = "بدون والد",
  className,
  disabled,
}: CategoryTreeSelectProps) {
  const exclude = new Set(excludeIds);
  // Also exclude descendants of excluded ids (prevents picking a child as parent of an ancestor)
  const allExcluded = new Set(exclude);
  let changed = true;
  while (changed) {
    changed = false;
    categories.forEach((c) => {
      if (c.parentId && allExcluded.has(c.parentId) && !allExcluded.has(c.id)) {
        allExcluded.add(c.id);
        changed = true;
      }
    });
  }

  const flat = flattenCategoryTree(categories).filter(
    (n) => !allExcluded.has(n.category.id)
  );

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {noneValue !== undefined && (
          <SelectItem value={noneValue} className="text-muted-foreground">
            {noneLabel}
          </SelectItem>
        )}
        {flat.map(({ category, depth, hasChildren }) => (
          <SelectItem
            key={category.id}
            value={category.id.toString()}
            className="py-2"
          >
            <span
              className="flex items-center gap-2"
              style={{ paddingInlineStart: `${depth * 16}px` }}
            >
              {depth > 0 ? (
                <CornerDownLeft className="h-3 w-3 text-muted-foreground/60 rotate-90 shrink-0" />
              ) : (
                <FolderTree className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              )}
              <span
                className={cn(
                  "truncate",
                  depth === 0 ? "font-semibold" : "font-normal",
                  depth > 1 && "text-muted-foreground"
                )}
              >
                {category.name}
              </span>
              {hasChildren && depth === 0 && (
                <span className="ms-auto text-[10px] text-muted-foreground/70">
                  گروه
                </span>
              )}
            </span>
          </SelectItem>
        ))}
        {flat.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            دسته‌بندی‌ای موجود نیست
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
