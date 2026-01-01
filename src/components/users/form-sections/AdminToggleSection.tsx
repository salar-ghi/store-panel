import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface AdminToggleSectionProps {
  form: UseFormReturn<any>;
}

export function AdminToggleSection({ form }: AdminToggleSectionProps) {
  return (
    <FormField
      control={form.control}
      name="isAdmin"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel className="flex items-center">
              <ShieldCheck className="h-4 w-4 ml-1 text-primary" />
              مدیر سیستم
            </FormLabel>
            <FormDescription>
              به این کاربر دسترسی‌های مدیریتی اعطا کنید
            </FormDescription>
          </div>
          <Checkbox
            checked={!!field.value}
            onCheckedChange={(v) => field.onChange(v === true)}
            aria-label="مدیر سیستم"
          />
        </FormItem>
      )}
    />
  );
}

