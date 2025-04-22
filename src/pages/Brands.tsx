
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, Pencil, Plus, Package } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "نام برند باید حداقل 2 کاراکتر باشد.",
  }),
  description: z.string().min(5, {
    message: "توضیحات باید حداقل 5 کاراکتر باشد.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Brands() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when editingBrand changes
  useEffect(() => {
    if (editingBrand) {
      form.reset({
        name: editingBrand.name,
        description: editingBrand.description,
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
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
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت ایجاد شد");
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد برند");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      return BrandService.update(id, {
        name: data.name,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("برند با موفقیت به‌روزرسانی شد");
      setIsOpen(false);
      setEditingBrand(null);
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
    });
    setIsOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">برندها</h2>
          <p className="text-muted-foreground">مدیریت برندهای محصولات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openDialog} 
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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

      <Card className="border shadow-sm backdrop-blur-sm bg-white/60">
        <CardHeader className="pb-3">
          <CardTitle>مدیریت برندها</CardTitle>
          <CardDescription>
            مشاهده و مدیریت تمامی برندهای محصولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">در حال بارگذاری برندها...</div>
          ) : brands.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center bg-muted/20">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">هیچ برندی یافت نشد</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>تاریخ ایجاد</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.description}</TableCell>
                      <TableCell>{new Date(brand.createdAt).toLocaleDateString('fa-IR')}</TableCell>
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
