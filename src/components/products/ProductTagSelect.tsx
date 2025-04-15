
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TagService } from "@/services/tag-service";
import { Tag as TagIcon, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tag } from "@/types/tag";

interface ProductTagSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
}

export function ProductTagSelect({ 
  value = [], 
  onChange, 
  maxTags = 10 
}: ProductTagSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: TagService.getAllTags,
  });

  // Update selected tags when tags are loaded
  useEffect(() => {
    if (tags && value.length > 0) {
      const selected = tags.filter(tag => value.includes(tag.id));
      setSelectedTags(selected);
    }
  }, [tags, value]);

  const handleSelect = (tagId: string) => {
    if (value.includes(tagId)) {
      // Remove tag if already selected
      onChange(value.filter(id => id !== tagId));
    } else if (value.length < maxTags) {
      // Add tag if not at max
      onChange([...value, tagId]);
    }
    setOpen(false);
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter(id => id !== tagId));
  };

  const getTagColor = (color?: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      cyan: "bg-cyan-500",
      orange: "bg-orange-500",
      teal: "bg-teal-500",
    };
    return color ? colorMap[color] || "bg-gray-500" : "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-between"
            disabled={value.length >= maxTags}
          >
            <span className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              {value.length === 0 ? "Select tags" : `${value.length} tags selected`}
            </span>
            <span className="text-xs text-muted-foreground">
              {`${value.length}/${maxTags}`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No tags found.</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {tags && tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelect(tag.id)}
                    className="flex items-center gap-2"
                  >
                    <div className={cn("w-3 h-3 rounded-full", getTagColor(tag.color))} />
                    <span>{tag.name}</span>
                    {value.includes(tag.id) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              className={cn("gap-1 pr-1", getTagColor(tag.color), "text-white")}
            >
              {tag.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-3 w-3 rounded-full bg-background/20 p-0 hover:bg-background/50"
                onClick={() => handleRemove(tag.id)}
              >
                <X className="h-2 w-2" />
                <span className="sr-only">Remove {tag.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
