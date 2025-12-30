
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AtSign, Phone, User, User2, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 pt-2 md:grid-cols-2 gap-4 flex items-center">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <User className="h-4 w-4 ml-1 text-muted-foreground" />
                نام
              </FormLabel>
              <FormControl>
                <Input placeholder="نام را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center" >
                <User className="h-4 w-4 ml-1 text-muted-foreground" />
                نام خانوادگی
                </FormLabel>
              <FormControl>
                <Input placeholder="نام خانوادگی را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
