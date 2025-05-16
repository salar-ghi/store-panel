
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

import { SupplierService } from "@/services/supplier-service";
import { Supplier, CreateSupplierRequest } from "@/types/supplier";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "نام تامین‌کننده باید حداقل 2 کاراکتر باشد.",
  }),
  contactInfo: z.string().min(5, {
    message: "اطلاعات تماس باید حداقل 5 کاراکتر باشد.",
  }),
  email: z.string().email({
    message: "ایمیل نامعتبر است.",
  }).optional().or(z.literal('')),
  phone: z.string().min(10, {
    message: "شماره تلفن باید حداقل 10 کاراکتر باشد.",
  }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  website: z.string().url({
    message: "وب‌سایت نامعتبر است.",
  }).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface AddSupplierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (supplier: Supplier | null) => void;
}

export function AddSupplierDialog({ 
  isOpen, 
  onOpenChange, 
  editingSupplier, 
  setEditingSupplier 
}: AddSupplierDialogProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      website: "",
    },
  });

  // Reset form when editingSupplier changes
  React.useEffect(() => {
    if (editingSupplier) {
      form.reset({
        name: editingSupplier.name,
        contactInfo: editingSupplier.contactInfo,
        email: editingSupplier.email || "",
        phone: editingSupplier.phone || "",
        address: editingSupplier.address || "",
        description: editingSupplier.description || "",
        website: editingSupplier.website || "",
      });
    } else {
      form.reset({
        name: "",
        contactInfo: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        website: "",
      });
    }
  }, [editingSupplier, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => {
      return SupplierService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت ایجاد شد");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد تامین‌کننده");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSupplierRequest }) => {
      return SupplierService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت به‌روزرسانی شد");
      onOpenChange(false);
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در به‌روزرسانی تامین‌کننده");
    },
  });

  function onSubmit(formData: FormData) {
    // Ensure all required properties are present
    const data: CreateSupplierRequest = {
      name: formData.name,
      contactInfo: formData.contactInfo,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      description: formData.description,
      website: formData.website,
    };

    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function openDialog() {
    setEditingSupplier(null);
    form.reset();
    onOpenChange(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          onClick={openDialog} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4 ml-1" />
          افزودن تامین‌کننده
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingSupplier ? "ویرایش تامین‌کننده" : "افزودن تامین‌کننده جدید"}</DialogTitle>
          <DialogDescription>
            {editingSupplier 
              ? "اطلاعات تامین‌کننده را در زیر ویرایش کنید"
              : "مشخصات تامین‌کننده جدید را وارد کنید"
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام تامین‌کننده</FormLabel>
                    <FormControl>
                      <Input placeholder="نام تامین‌کننده را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اطلاعات تماس</FormLabel>
                    <FormControl>
                      <Input placeholder="اطلاعات تماس را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ایمیل را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تلفن</FormLabel>
                    <FormControl>
                      <Input placeholder="شماره تلفن را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس</FormLabel>
                  <FormControl>
                    <Input placeholder="آدرس را وارد کنید" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وب‌سایت</FormLabel>
                    <FormControl>
                      <Input placeholder="وب‌سایت را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="توضیحات را وارد کنید" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingSupplier 
                  ? updateMutation.isPending ? "در حال به‌روزرسانی..." : "به‌روزرسانی تامین‌کننده" 
                  : createMutation.isPending ? "در حال ایجاد..." : "افزودن تامین‌کننده"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
