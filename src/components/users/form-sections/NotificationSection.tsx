
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface NotificationSectionProps {
  form: UseFormReturn<any>;
}

export function NotificationSection({ form }: NotificationSectionProps) {
  return (
    <FormField
      control={form.control}
      name="notificationMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <Bell className="h-4 w-4 ml-1 text-muted-foreground" />
            روش اطلاع‌رسانی
          </FormLabel>
          <FormDescription>
            اطلاعات ورود به چه روشی به کاربر ارسال شود؟
          </FormDescription>
          <FormControl >
            <RadioGroup dir="rtl"
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-1 mt-2"
            >
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="email" id="email" />
                <label htmlFor="email" className="font-normal pr-2 cursor-pointer">
                  فقط ایمیل
                </label>
              </div>
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="sms" id="sms" />
                <label htmlFor="sms" className="font-normal pr-2 cursor-pointer">
                  فقط پیامک
                </label>
              </div>
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="both" id="both" />
                <label htmlFor="both" className="font-normal pr-2 cursor-pointer">
                  هم ایمیل و هم پیامک
                </label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
