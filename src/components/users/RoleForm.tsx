
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserService } from "@/services/user-service";
import { toast } from "@/components/ui/use-toast";
import { AVAILABLE_PERMISSIONS } from "@/types/user";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "نام نقش باید حداقل ۲ کاراکتر باشد"),
  permissions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleFormProps {
  onRoleAdded: () => void;
}

export function RoleForm({ onRoleAdded }: RoleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const togglePermission = (current: string[], permission: string) => {
    let next: string[];

    // Special handling for 'all' permission
    if (permission === "all") {
      next = current.includes("all") ? [] : [...AVAILABLE_PERMISSIONS];
    } else {
      next = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];

      // If 'all' was selected, remove it too
      if (next.includes("all") && permission !== "all") {
        next = next.filter((p) => p !== "all");
      }

      // Auto-add 'all' when every individual permission is selected
      const individualPermissions = AVAILABLE_PERMISSIONS.filter((p) => p !== "all");
      const allSelected = individualPermissions.every((p) => next.includes(p));
      if (allSelected && !next.includes("all")) {
        next = [...next, "all"];
      }
    }

    return next;
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await UserService.createRole({
        name: data.name,
        permissions: data.permissions && data.permissions.length > 0 ? data.permissions : undefined,
      });

      toast({
        title: "موفقیت",
        description: "نقش با موفقیت ایجاد شد!",
        variant: "default",
      });

      form.reset();
      onRoleAdded();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در ایجاد نقش",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4" dir="rtl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام نقش</FormLabel>
              <FormControl>
                <Input placeholder="نام نقش را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel>دسترسی‌ها</FormLabel>
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div 
                      key={permission}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedPermissions.includes(permission) 
                          ? "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => handlePermissionToggle(permission)}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id={`perm-${permission}`}
                          checked={selectedPermissions.includes(permission)}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <label 
                          htmlFor={`perm-${permission}`} 
                          className="mr-2 font-medium cursor-pointer"
                        >
                          {permission === 'read' && 'خواندن'}
                          {permission === 'write' && 'نوشتن'}
                          {permission === 'update' && 'به‌روزرسانی'}
                          {permission === 'delete' && 'حذف'}
                          {permission === 'all' && 'همه دسترسی‌ها'}
                        </label>
                      </div>
                      {selectedPermissions.includes(permission) && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "در حال ایجاد..." : "ایجاد نقش"}
        </Button>
      </form>
    </Form>
  );
}
