import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserService } from "@/services/user-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Loader2, Pencil, X, Save, User as UserIcon, Mail, Phone, Shield, IdCard, AtSign, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { DescriptionSection } from "./form-sections/DescriptionSection";
import { AdminToggleSection } from "./form-sections/AdminToggleSection";
import { RolesSection } from "./form-sections/RolesSection";

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

const editSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر وارد کنید").optional().or(z.literal("")),
  phoneNumber: z.string().min(10, "شماره تلفن معتبر وارد کنید"),
  description: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "حداقل یک نقش انتخاب کنید"),
  isAdmin: z.boolean().default(false),
});

type EditValues = z.infer<typeof editSchema>;

export function UserDetailsDialog({ userId, open, onClose }: UserDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: open,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
    enabled: open && isEditing,
  });

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
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

  useEffect(() => {
    if (user && isEditing) {
      const matchedRoleIds = (roles || [])
        .filter((r) => user.roles?.includes(r.name))
        .map((r) => String(r.id));
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        description: user.description || "",
        roleIds: matchedRoleIds,
        isAdmin: !!user.isAdmin,
      });
    }
  }, [user, isEditing, roles, form]);

  const updateMutation = useMutation({
    mutationFn: (values: EditValues) =>
      UserService.updateUser(userId, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber,
        description: values.description,
        roleIds: values.roleIds,
        isAdmin: values.isAdmin,
      }),
    onSuccess: () => {
      toast({ title: "موفقیت", description: "اطلاعات کاربر بروزرسانی شد" });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast({
        title: "خطا",
        description: err?.response?.data?.message || "بروزرسانی کاربر با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-12 px-6">
            بارگذاری اطلاعات کاربر با خطا مواجه شد
          </div>
        ) : user ? (
          <>
            {/* Hero header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b">
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
              </div>

              <div className="relative p-6 flex items-start gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/30">
                    {initials}
                  </div>
                  {user.isAdmin && (
                    <div className="absolute -bottom-1 -left-1 bg-amber-500 rounded-full p-1 shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <DialogHeader className="space-y-1 text-right">
                    <DialogTitle className="text-2xl font-bold">
                      {fullName || user.username}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-sm">
                      <AtSign className="w-3.5 h-3.5" />
                      {user.username}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {user.isAdmin && (
                      <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 gap-1">
                        <Shield className="w-3 h-3" />
                        مدیر سیستم
                      </Badge>
                    )}
                    {user.roles?.length ? (
                      user.roles.map((role, i) => (
                        <Badge key={i} variant="outline" className="border-primary/30">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">بدون نقش</Badge>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="gap-2 shadow-md"
                  >
                    <Pencil className="w-4 h-4" />
                    ویرایش
                  </Button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoCard icon={<UserIcon className="w-4 h-4" />} label="نام و نام خانوادگی" value={fullName || "—"} />
                    <InfoCard icon={<AtSign className="w-4 h-4" />} label="نام کاربری" value={user.username} />
                    <InfoCard icon={<Mail className="w-4 h-4" />} label="ایمیل" value={user.email || "ثبت نشده"} />
                    <InfoCard icon={<Phone className="w-4 h-4" />} label="شماره تماس" value={user.phoneNumber} dir="ltr" />
                  </div>

                  {user.description && (
                    <Card className="p-4 bg-muted/30 border-dashed">
                      <p className="text-xs font-medium text-muted-foreground mb-1">توضیحات</p>
                      <p className="text-sm leading-relaxed">{user.description}</p>
                    </Card>
                  )}

                  <Separator />

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IdCard className="w-3.5 h-3.5" />
                    <span>شناسه کاربر:</span>
                    <code className="font-mono bg-muted px-2 py-0.5 rounded text-[11px]">{user.id}</code>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))}
                    className="space-y-6"
                  >
                    <BasicInfoSection form={form} />
                    <DescriptionSection form={form} />
                    <Separator />
                    <AdminToggleSection form={form} />
                    <RolesSection form={form} roles={roles} />

                    <DialogFooter className="gap-2 sm:gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={updateMutation.isPending}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        انصراف
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="gap-2"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        ذخیره تغییرات
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon,
  label,
  value,
  dir,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="group relative p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
        <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-sm font-semibold truncate" dir={dir}>
        {value}
      </p>
    </div>
  );
}
