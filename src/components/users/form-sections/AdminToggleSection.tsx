import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useCallback } from "react";

interface AdminToggleSectionProps {
  form: UseFormReturn<any>;
}

export function AdminToggleSection({ form }: AdminToggleSectionProps) {
  const handleCheckedChange = useCallback((checked: boolean) => {
    form.setValue("isAdmin", checked, { shouldValidate: true });
  }, [form]);

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
            checked={field.value ?? false}
            onCheckedChange={handleCheckedChange}
          />
        </FormItem>
      )}
    />
  );
}
