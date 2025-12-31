import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "daily", label: "روزانه" },
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
  { value: "yearly", label: "سالانه" },
];

export function TimeRangeFilter({ value, onChange, className }: TimeRangeFilterProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      {timeRanges.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(range.value)}
          className={cn(
            "text-xs transition-all",
            value === range.value && "shadow-sm"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
