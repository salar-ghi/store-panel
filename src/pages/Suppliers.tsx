
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, Pencil, Plus, Truck, Check, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

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

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => {
      return SupplierService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت ایجاد شد");
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد تامین‌کننده");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      return SupplierService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت به‌روزرسانی شد");
      setIsOpen(false);
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در به‌روزرسانی تامین‌کننده");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: SupplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف تامین‌کننده");
    },
  });

  const approveMutation = useMutation({
    mutationFn: SupplierService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تامین‌کننده با موفقیت تایید شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تایید تامین‌کننده");
    },
  });

  function onSubmit(data: FormData) {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setIsOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm("آیا از حذف این تامین‌کننده اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  }
  
  function handleApprove(id: number) {
    approveMutation.mutate(id);
  }

  function openDialog() {
    setEditingSupplier(null);
    form.reset();
    setIsOpen(true);
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تامین‌کنندگان</h2>
          <p className="text-muted-foreground">مدیریت تامین‌کنندگان محصولات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
      </div>

      <Card className="border shadow-sm bg-black text-white">
        <CardHeader className="pb-3">
          <CardTitle>مدیریت تامین‌کنندگان</CardTitle>
          <CardDescription className="text-gray-400">
            مشاهده و مدیریت تمامی تامین‌کنندگان محصولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-300">در حال بارگذاری تامین‌کنندگان...</div>
          ) : suppliers.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center bg-gray-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">هیچ تامین‌کننده‌ای یافت نشد</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                با ایجاد اولین تامین‌کننده خود شروع کنید
              </p>
              <Button 
                variant="outline" 
                onClick={openDialog}
                className="mt-2"
              >
                <Plus className="ml-2 h-4 w-4" />
                افزودن تامین‌کننده
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-gray-800">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>اطلاعات تماس</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="border-gray-800 hover:bg-gray-900/50">
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactInfo}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>
                        {supplier.isApproved ? (
                          <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-500/50">
                            تایید شده
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-500/50">
                            در انتظار تایید
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(supplier)}
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          {!supplier.isApproved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(supplier.id)}
                              className="hover:bg-green-500/10 text-green-500"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(supplier.id)}
                            className="hover:bg-destructive/10 text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
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
