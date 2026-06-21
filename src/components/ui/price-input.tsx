import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatNumber, parseNumeric } from '@/lib/format';

export interface PriceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | string | undefined;
  onChange: (value: number) => void;
  allowDecimal?: boolean;
  suffix?: React.ReactNode;
}

/**
 * Numeric input with thousand separators (1,500,000).
 * - Stores raw number via onChange, displays formatted string.
 * - Latin digits + commas (easier to type than Persian separator).
 * - Use formatPrice() for displaying the value elsewhere.
 */
export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, allowDecimal = false, suffix, className, dir, ...props }, ref) => {
    const [display, setDisplay] = React.useState<string>(() =>
      value === undefined || value === '' || value === 0
        ? ''
        : formatNumber(value),
    );

    // Sync from outside (e.g. form reset)
    React.useEffect(() => {
      const incomingNum = parseNumeric(value);
      const currentNum = parseNumeric(display);
      if (incomingNum !== currentNum) {
        setDisplay(
          value === undefined || value === '' || value === 0
            ? ''
            : formatNumber(value),
        );
      }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;
      // allow user to clear
      if (raw === '') {
        setDisplay('');
        onChange(0);
        return;
      }
      // keep optional trailing dot while user types decimals
      const hasTrailingDot = allowDecimal && raw.endsWith('.');
      const num = parseNumeric(raw);
      const formatted = formatNumber(raw);
      setDisplay(hasTrailingDot ? formatted + '.' : formatted);
      onChange(num);
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          dir={dir ?? 'ltr'}
          value={display}
          onChange={handleChange}
          className={cn(suffix ? 'pl-14' : '', className)}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
PriceInput.displayName = 'PriceInput';
