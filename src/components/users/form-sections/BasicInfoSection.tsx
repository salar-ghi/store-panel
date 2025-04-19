
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AtSign, Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نام و نام خانوادگی</FormLabel>
            <FormControl>
              <Input placeholder="نام و نام خانوادگی را وارد کنید" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <AtSign className="h-4 w-4 ml-1 text-muted-foreground" />
              ایمیل
            </FormLabel>
            <FormControl>
              <Input placeholder="ایمیل را وارد کنید" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Phone className="h-4 w-4 ml-1 text-muted-foreground" />
              شماره موبایل
            </FormLabel>
            <FormControl>
              <Input placeholder="شماره موبایل را وارد کنید" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
