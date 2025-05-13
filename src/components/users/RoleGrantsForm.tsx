
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserService } from "@/services/user-service";
import { toast } from "@/components/ui/use-toast";
import { Role, Permission, AVAILABLE_PERMISSIONS } from "@/types/user";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Check } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "نام نقش باید حداقل ۲ کاراکتر باشد"),
  permissions: z.array(z.string()).min(1, "حداقل یک دسترسی انتخاب کنید"),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleGrantsFormProps {
  onRoleAdded: () => void;
}

export function RoleGrantsForm({ onRoleAdded }: RoleGrantsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const handlePermissionToggle = (permission: string) => {
    // Special handling for 'all' permission
    if (permission === 'all') {
      if (selectedPermissions.includes('all')) {
        // If 'all' is already selected, unselect it and all other permissions
        setSelectedPermissions([]);
        form.setValue('permissions', []);
      } else {
        // If 'all' is being selected, select all permissions
        const allPermissions = AVAILABLE_PERMISSIONS;
        setSelectedPermissions(allPermissions);
        form.setValue('permissions', allPermissions);
      }
      return;
    }
    
    // Handle regular permission toggle
    setSelectedPermissions(prev => {
      // If 'all' is selected and we're unchecking something, remove 'all'
      if (prev.includes('all')) {
        const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p => p !== permission && p !== 'all');
        form.setValue('permissions', filteredPermissions);
        return filteredPermissions;
      }
      
      const newSelection = prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission];
      
      // Check if all individual permissions are selected, then add 'all'
      const individualPermissions = AVAILABLE_PERMISSIONS.filter(p => p !== 'all');
      const allIndividualSelected = individualPermissions.every(p => 
        newSelection.includes(p) || p === permission && !prev.includes(permission)
      );
      
      const finalSelection = allIndividualSelected 
        ? [...individualPermissions, 'all']
        : newSelection;
      
      form.setValue('permissions', finalSelection);
      return finalSelection;
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedPermissions.length === 0) {
      toast({
        title: "خطا",
        description: "لطفاً حداقل یک دسترسی انتخاب کنید",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await UserService.createRole({
        name: data.name,
        permissions: selectedPermissions
      });
      
      toast({
        title: "نقش ایجاد شد",
        description: `نقش ${data.name} با موفقیت ایجاد شد`,
      });
      
      form.reset();
      setSelectedPermissions([]);
      onRoleAdded();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در ایجاد نقش",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" dir="rtl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام نقش</FormLabel>
              <FormControl>
                <Input placeholder="نام نقش را وارد کنید" {...field} />
              </FormControl>
              <FormDescription>
                نام نقش باید منحصر به فرد باشد
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Shield className="h-4 w-4 ml-1 text-muted-foreground" />
                دسترسی‌ها
              </FormLabel>
              <FormDescription>
                دسترسی‌های مورد نیاز برای این نقش را انتخاب کنید
              </FormDescription>
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div 
                      key={permission}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPermissions.includes(permission) 
                          ? "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => handlePermissionToggle(permission)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={() => handlePermissionToggle(permission)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                        />
                        <div className="mr-2 capitalize">
                          <p className="font-medium">
                            {permission === 'read' && 'خواندن'}
                            {permission === 'write' && 'نوشتن'}
                            {permission === 'update' && 'به‌روزرسانی'}
                            {permission === 'delete' && 'حذف'}
                            {permission === 'all' && 'همه دسترسی‌ها'}
                          </p>
                        </div>
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

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? "در حال ایجاد..." : "ایجاد نقش"}
        </Button>
      </form>
    </Form>
  );
}
