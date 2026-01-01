
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { DescriptionSection } from "./form-sections/DescriptionSection";
import { AdminToggleSection } from "./form-sections/AdminToggleSection";
import { RolesSection } from "./form-sections/RolesSection";
import { UserPlus, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("لطفاً یک ایمیل معتبر وارد کنید"),
  phoneNumber: z.string().min(10, "لطفاً یک شماره تلفن معتبر وارد کنید"),
  description: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "حداقل یک نقش انتخاب کنید"),
  isAdmin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onUserAdded: () => void;
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
      isAdmin: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await UserService.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        description: data.description,
        roleIds: data.roleIds,
        isAdmin: data.isAdmin,
      });

      toast({
        title: "کاربر ایجاد شد",
        description: `کاربر ${data.firstName} ${data.lastName} با موفقیت ایجاد شد!`,
      });
      
      if (data.isAdmin) {
        toast({
          title: "نقش مدیر اختصاص داده شد",
          description: "به این کاربر دسترسی‌های مدیریتی داده شده است",
        });
      }
      
      form.reset();
      setCurrentStep(1);
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

  const steps = [
    { id: 1, title: "اطلاعات پایه", icon: "👤" },
    { id: 2, title: "نقش‌ها و دسترسی", icon: "🔐" },
  ];

  const validateStep1 = async () => {
    const result = await form.trigger(['firstName', 'lastName', 'email', 'phoneNumber']);
    if (result) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.button
              type="button"
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : currentStep > step.id
                  ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
              whileHover={step.id <= currentStep ? { scale: 1.05 } : {}}
              whileTap={step.id <= currentStep ? { scale: 0.95 } : {}}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="font-medium text-sm">{step.title}</span>
            </motion.button>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-12 transition-colors duration-300 ${
                currentStep > step.id ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">اطلاعات کاربر</h3>
                        <p className="text-sm text-muted-foreground">مشخصات اولیه کاربر جدید را وارد کنید</p>
                      </div>
                    </div>
                    
                    <BasicInfoSection form={form} />
                    <DescriptionSection form={form} />
                    
                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={validateStep1}
                        className="min-w-[120px] gap-2"
                      >
                        مرحله بعد
                        <span className="rotate-180">←</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">نقش‌ها و دسترسی</h3>
                        <p className="text-sm text-muted-foreground">سطح دسترسی و نقش‌های کاربر را مشخص کنید</p>
                      </div>
                    </div>

                    <AdminToggleSection form={form} />
                    
                    <RolesSection 
                      form={form}
                      roles={roles}
                    />
                    
                    <div className="flex justify-between gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="min-w-[120px] gap-2"
                      >
                        <span>←</span>
                        مرحله قبل
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[140px] gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            در حال ایجاد...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            ایجاد کاربر
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
