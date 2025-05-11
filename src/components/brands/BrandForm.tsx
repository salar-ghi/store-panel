
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Upload } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Brand, CreateBrandRequest } from "@/types/brand";
import { BrandService } from "@/services/brand-service";
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
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "نام برند باید حداقل 2 کاراکتر باشد.",
  }),
  description: z.string().min(5, {
    message: "توضیحات باید حداقل 5 کاراکتر باشد.",
  }),
  logo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BrandFormProps {
  onSuccess: () => void;
  editingBrand: Brand | null;
}

export function BrandForm({ onSuccess, editingBrand }: BrandFormProps) {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
    },
  });

  // Reset form when editingBrand changes
  useEffect(() => {
    if (editingBrand) {
      form.reset({
        name: editingBrand.name,
        description: editingBrand.description,
        logo: editingBrand.logo || "",
      });
      setLogoPreview(editingBrand.logo || null);
    } else {
      form.reset({
        name: "",
        description: "",
        logo: "",
      });
      setLogoPreview(null);
    }
  }, [editingBrand, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      return BrandService.create({
        name: data.name,
        description: data.description,
        logo: data.logo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت ایجاد شد");
      onSuccess();
      form.reset();
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد برند");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      return BrandService.update(id, {
        name: data.name,
        description: data.description,
        logo: data.logo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت به‌روزرسانی شد");
      onSuccess();
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در به‌روزرسانی برند");
    },
  });

  function onSubmit(data: FormData) {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue("logo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editingBrand ? "ویرایش برند" : "افزودن برند جدید"}</DialogTitle>
        <DialogDescription>
          {editingBrand 
            ? "اطلاعات برند را در زیر ویرایش کنید"
            : "مشخصات برند جدید را وارد کنید"
          }
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel className="self-start">لوگوی برند</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 p-1">
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt="Brand logo" />
                      ) : (
                        <AvatarFallback className="bg-gray-100">
                          <Image className="h-12 w-12 text-gray-400" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input
                      type="file"
                      id="brand-logo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("brand-logo")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? "تغییر لوگو" : "انتخاب لوگو"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام برند</FormLabel>
                <FormControl>
                  <Input placeholder="نام برند را وارد کنید" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیحات</FormLabel>
                <FormControl>
                  <Input placeholder="توضیحات برند را وارد کنید" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingBrand 
                ? updateMutation.isPending ? "در حال به‌روزرسانی..." : "به‌روزرسانی برند" 
                : createMutation.isPending ? "در حال ایجاد..." : "افزودن برند"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
