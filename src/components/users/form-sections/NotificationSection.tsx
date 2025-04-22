
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
          <FormControl dir="rtl">
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1 mt-2"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="email" />
                </FormControl>
                <FormLabel className="font-normal pr-3 mr-3">
                  فقط ایمیل
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="sms" />
                </FormControl>
                <FormLabel className="font-normal pr-3 ml-3">
                  فقط پیامک
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="both" />
                </FormControl>
                <FormLabel className="font-normal pr-3 ml-3">
                  هم ایمیل و هم پیامک
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
