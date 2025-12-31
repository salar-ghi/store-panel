import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
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
              <ShieldCheck className="h-4 w-4 ml-1 text-purple-500" />
              مدیر سیستم
            </FormLabel>
            <FormDescription>
              به این کاربر دسترسی‌های مدیریتی اعطا کنید
            </FormDescription>
          </div>
          <Switch
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}
