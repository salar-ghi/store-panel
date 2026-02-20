
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";
import {
  toJalaali,
  toGregorian,
  getPersianMonthName,
  getPersianWeekDays,
  buildMonthGrid,
  toPersianDigits,
  formatPersianDate,
  JalaaliDate,
} from "@/lib/persian-date";

interface PersianDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  className?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  disabledDate,
  className,
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);

  const today = useMemo(() => toJalaali(new Date()), []);
  const selected = useMemo(() => (value ? toJalaali(value) : null), [value]);

  const [viewYear, setViewYear] = useState(selected?.jy || today.jy);
  const [viewMonth, setViewMonth] = useState(selected?.jm || today.jm);

  const weeks = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = getPersianWeekDays();

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleSelect = (day: number) => {
    const gregorianDate = toGregorian(viewYear, viewMonth, day);
    if (disabledDate && disabledDate(gregorianDate)) return;
    onChange?.(gregorianDate);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected && selected.jy === viewYear && selected.jm === viewMonth && selected.jd === day;

  const isToday = (day: number) =>
    today.jy === viewYear && today.jm === viewMonth && today.jd === day;

  const isDayDisabled = (day: number) => {
    if (!disabledDate) return false;
    return disabledDate(toGregorian(viewYear, viewMonth, day));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-right font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? formatPersianDate(value) : <span>{placeholder}</span>}
          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start" dir="rtl">
        <div className="p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent rounded-full"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {getPersianMonthName(viewMonth)}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {toPersianDigits(viewYear)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent rounded-full"
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0">
                {week.map((day, di) => (
                  <div key={di} className="flex items-center justify-center">
                    {day ? (
                      <button
                        type="button"
                        disabled={isDayDisabled(day)}
                        onClick={() => handleSelect(day)}
                        className={cn(
                          "h-8 w-8 rounded-full text-sm font-medium transition-all duration-150",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected(day) &&
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
                          isToday(day) && !isSelected(day) &&
                            "bg-accent text-accent-foreground font-bold",
                          isDayDisabled(day) &&
                            "opacity-30 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        {toPersianDigits(day)}
                      </button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setViewYear(today.jy);
                setViewMonth(today.jm);
                const todayDate = new Date();
                onChange?.(todayDate);
                setOpen(false);
              }}
            >
              امروز — {formatPersianDate(new Date())}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
