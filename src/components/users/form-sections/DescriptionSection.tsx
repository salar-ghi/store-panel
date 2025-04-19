
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface DescriptionSectionProps {
  form: UseFormReturn<any>;
}

export function DescriptionSection({ form }: DescriptionSectionProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <FileText className="h-4 w-4 ml-1 text-muted-foreground" />
            توضیحات
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder="توضیحات یا یادداشت‌های کاربر را وارد کنید (اختیاری)" 
              className="resize-none min-h-[80px]"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
