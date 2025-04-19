
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { DescriptionSection } from "./form-sections/DescriptionSection";
import { AdminToggleSection } from "./form-sections/AdminToggleSection";
import { NotificationSection } from "./form-sections/NotificationSection";
import { RolesSection } from "./form-sections/RolesSection";
import { SuccessSection } from "./form-sections/SuccessSection";

const formSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد"),
  email: z.string().email("لطفاً یک ایمیل معتبر وارد کنید"),
  phoneNumber: z.string().min(10, "لطفاً یک شماره تلفن معتبر وارد کنید"),
  description: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "حداقل یک نقش انتخاب کنید"),
  generatePassword: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
  notificationMethod: z.enum(["email", "sms", "both"]).default("email"),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onUserAdded: () => void;
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      description: "",
      roleIds: [],
      generatePassword: true,
      isAdmin: false,
      notificationMethod: "email",
    },
  });

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSelection = prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId];
      
      form.setValue('roleIds', newSelection);
      return newSelection;
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const passwordToSend = UserService.generateRandomPassword();
      
      const user = await UserService.createUser({
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        description: data.description,
        roleIds: data.roleIds,
        generatePassword: true,
        isAdmin: data.isAdmin,
        notificationMethod: data.notificationMethod
      });

      setGeneratedPassword(passwordToSend);
      
      let successMessage = `کاربر ${data.username} با موفقیت ایجاد شد!`;
      toast.success(successMessage);
      
      if (data.isAdmin) {
        toast("نقش مدیر اختصاص داده شد", {
          description: "به این کاربر دسترسی‌های مدیریتی داده شده است"
        });
      }
      
      toast.success(`اطلاعات ورود از طریق ${data.notificationMethod === "email" ? "ایمیل" : data.notificationMethod === "sms" ? "پیامک" : "ایمیل و پیامک"} ارسال خواهد شد`, {
        description: data.notificationMethod === "both" 
          ? "کاربر اطلاعات ورود را از طریق ایمیل و پیامک دریافت خواهد کرد" 
          : `کاربر اطلاعات ورود را از طریق ${data.notificationMethod === "email" ? "ایمیل" : "پیامک"} دریافت خواهد کرد`
      });
      
      if (!generatedPassword) {
        form.reset();
        setSelectedRoles([]);
      }
      
      onUserAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ایجاد کاربر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4" dir="rtl">
        {generatedPassword ? (
          <SuccessSection 
            generatedPassword={generatedPassword} 
            onReset={() => {
              setGeneratedPassword(null);
              form.reset();
            }}
          />
        ) : (
          <>
            <BasicInfoSection form={form} />
            <DescriptionSection form={form} />
            <AdminToggleSection form={form} />
            <NotificationSection form={form} />
            <Separator className="my-4" />
            <RolesSection 
              form={form}
              roles={roles}
              selectedRoles={selectedRoles}
              onRoleToggle={handleRoleToggle}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "در حال ایجاد..." : "ایجاد کاربر"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
