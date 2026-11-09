import { useState } from "react";
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import { Button } from "@/components/ui/button";
import { CalendarRange, X } from "lucide-react";

interface JalaliDateRangePickerProps {
  fromDate?: Date;
  toDate?: Date;
  onChange: (range: { fromDate?: Date; toDate?: Date }) => void;
  className?: string;
}

export function JalaliDateRangePicker({
  fromDate,
  toDate,
  onChange,
  className = "",
}: JalaliDateRangePickerProps) {
  const [internalFrom, setInternalFrom] = useState<Date | undefined>(fromDate);
  const [internalTo, setInternalTo] = useState<Date | undefined>(toDate);

  const handleFromChange = (d: Date | undefined) => {
    setInternalFrom(d);
    onChange({ fromDate: d, toDate: internalTo });
  };

  const handleToChange = (d: Date | undefined) => {
    setInternalTo(d);
    onChange({ fromDate: internalFrom, toDate: d });
  };

  const clearRange = () => {
    setInternalFrom(undefined);
    setInternalTo(undefined);
    onChange({ fromDate: undefined, toDate: undefined });
  };

  const hasFilter = !!internalFrom || !!internalTo;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} dir="rtl">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <CalendarRange className="h-4 w-4 text-primary" />
        <span>بازه زمانی (شمسی):</span>
      </div>

      <div className="w-[140px]">
        <PersianDatePicker
          value={internalFrom}
          onChange={handleFromChange}
          placeholder="از تاریخ"
        />
      </div>

      <span className="text-xs text-muted-foreground">تا</span>

      <div className="w-[140px]">
        <PersianDatePicker
          value={internalTo}
          onChange={handleToChange}
          placeholder="تا تاریخ"
        />
      </div>

      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearRange}
          className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          title="حذف فیلتر تاریخ"
        >
          <X className="h-3.5 w-3.5 ml-1" /> حذف بازه
        </Button>
      )}
    </div>
  );
}
