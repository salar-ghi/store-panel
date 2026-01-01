import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectItem {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface MultiSelectCheckboxProps {
  items: MultiSelectItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  noResultsMessage?: string;
  selectAllLabel?: string;
  deselectAllLabel?: string;
  searchPlaceholder?: string;
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showSelectAll?: boolean;
}

export function MultiSelectCheckbox({
  items,
  selectedIds,
  onSelectionChange,
  placeholder,
  emptyMessage = "هیچ موردی موجود نیست",
  emptySubMessage = "ابتدا موارد را ایجاد کنید",
  noResultsMessage = "موردی با این عبارت یافت نشد",
  selectAllLabel = "انتخاب همه",
  deselectAllLabel = "لغو همه",
  searchPlaceholder = "جستجو...",
  className,
  maxHeight = "16rem",
  showSearch = true,
  showSelectAll = true,
}: MultiSelectCheckboxProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredItems.map((item) => item.id);
    if (allFilteredSelected) {
      onSelectionChange(selectedIds.filter((id) => !filteredIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedIds, ...filteredIds])];
      onSelectionChange(newSelection);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.length > 0 && (showSearch || showSelectAll) && (
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          )}
          {showSelectAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="shrink-0 gap-1.5"
            >
              {allFilteredSelected ? (
                <>
                  <Square className="h-4 w-4" />
                  {deselectAllLabel}
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  {selectAllLabel}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div
        className="space-y-2 overflow-y-auto scrollbar-hidden"
        style={{ maxHeight }}
      >
        {items.length > 0 ? (
          filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200",
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleToggle(item.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => handleToggle(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 2).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-muted-foreground text-sm">{noResultsMessage}</p>
            </div>
          )
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {emptySubMessage}
            </p>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{selectedIds.length}</Badge>
          <span>مورد انتخاب شده</span>
        </div>
      )}
    </div>
  );
}
