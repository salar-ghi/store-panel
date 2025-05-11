
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, Pencil, Plus, Package, Upload, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BrandService } from "@/services/brand-service";
import { Brand } from "@/types/brand";
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

export default function Brands() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
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

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandService.getAll,
  });

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
      setIsOpen(false);
      form.reset();
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد برند");
    },
  });

  // Modified to send id and brand as separate parameters
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
      setIsOpen(false);
      setEditingBrand(null);
      setLogoPreview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در به‌روزرسانی برند");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: BrandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف برند");
    },
  });

  function onSubmit(data: FormData) {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setIsOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm("آیا از حذف این برند اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  }

  function openDialog() {
    setEditingBrand(null);
    form.reset({
      name: "",
      description: "",
      logo: "",
    });
    setLogoPreview(null);
    setIsOpen(true);
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
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">برندها</h2>
          <p className="text-muted-foreground">مدیریت برندهای محصولات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openDialog} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4 ml-1" />
              افزودن برند
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm bg-black text-white">
        <CardHeader className="pb-3">
          <CardTitle>مدیریت برندها</CardTitle>
          <CardDescription className="text-gray-400">
            مشاهده و مدیریت تمامی برندهای محصولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-300">در حال بارگذاری برندها...</div>
          ) : brands.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center bg-gray-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">هیچ برندی یافت نشد</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                با ایجاد اولین برند خود شروع کنید
              </p>
              <Button 
                variant="outline" 
                onClick={openDialog}
                className="mt-2"
              >
                <Plus className="ml-2 h-4 w-4" />
                افزودن برند
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-gray-800">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow>
                    <TableHead className="w-16">لوگو</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>تاریخ ایجاد</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id} className="border-gray-800 hover:bg-gray-900/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {brand.logo ? (
                            <AvatarImage src={brand.logo} alt={brand.name} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {brand.name.substring(0, 2)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.description}</TableCell>
                      <TableCell>{new Date(brand.createdTime).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(brand)}
                          className="hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(brand.id)}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
