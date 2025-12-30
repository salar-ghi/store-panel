
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { toast } from "@/components/ui/use-toast";
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
  firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
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
      firstName: "",
      lastName: "",
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
      
      // Directly update form value without triggering useEffect
      form.setValue('roleIds', newSelection, { shouldValidate: true });
      return newSelection;
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedRoles.length === 0) {
      toast({
        title: "خطا",
        description: "لطفاً حداقل یک نقش انتخاب کنید",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const passwordToSend = data.generatePassword ? UserService.generateRandomPassword() : undefined;
      
      const user = await UserService.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        description: data.description,
        roleIds: selectedRoles,
        generatePassword: data.generatePassword,
        password: passwordToSend,
        isAdmin: data.isAdmin,
        notificationMethod: data.notificationMethod
      });

      if (passwordToSend) {
        setGeneratedPassword(passwordToSend);
      }
      
      let successMessage = `کاربر ${data.firstName} ${data.lastName} با موفقیت ایجاد شد!`;
      toast({
        title: "کاربر ایجاد شد",
        description: successMessage,
      });
      
      if (data.isAdmin) {
        toast({
          title: "نقش مدیر اختصاص داده شد",
          description: "به این کاربر دسترسی‌های مدیریتی داده شده است",
        });
      }
      
      toast({
        title: "ارسال اطلاعات ورود", 
        description: `اطلاعات ورود از طریق ${data.notificationMethod === "email" ? "ایمیل" : data.notificationMethod === "sms" ? "پیامک" : "ایمیل و پیامک"} ارسال خواهد شد`
      });
      
      if (!generatedPassword) {
        form.reset();
        setSelectedRoles([]);
      }
      
      onUserAdded();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در ایجاد کاربر",
        variant: "destructive"
      });
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
              setSelectedRoles([]);
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
