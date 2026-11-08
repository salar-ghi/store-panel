import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { MapPin, Plus, Edit, Trash, PackageSearch } from "lucide-react";
import { WarehouseService } from "@/services/warehouse-service";
import { Warehouse } from "@/types/warehouse";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const locationFormSchema = z.object({
  name: z.string().min(2, { message: "نام مکان باید حداقل ۲ کاراکتر باشد" }),
  address: z.string().min(5, { message: "آدرس باید حداقل ۵ کاراکتر باشد" }),
  capacity: z.coerce.number().positive({ message: "ظرفیت باید عدد مثبت باشد" }),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function InventoryLocations() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Warehouse | null>(null);

  // Server-side query state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageIndex(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["warehouses", "paged", pageIndex, pageSize, debouncedSearch],
    queryFn: () =>
      WarehouseService.getPaged({
        pageIndex,
        pageSize,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  const locations = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const createMutation = useMutation({
    mutationFn: (values: LocationFormValues) =>
      WarehouseService.create({
        name: values.name,
        address: values.address,
        capacity: values.capacity,
        currentOccupancy: 0,
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("مکان انبار با موفقیت اضافه شد");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("خطا در ایجاد مکان انبار"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: updateData }: { id: number; data: LocationFormValues }) =>
      WarehouseService.update(id, {
        id,
        name: updateData.name,
        address: updateData.address,
        capacity: updateData.capacity,
        currentOccupancy: editingLocation?.currentOccupancy ?? 0,
        isActive: editingLocation?.isActive ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("مکان انبار با موفقیت به‌روزرسانی شد");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("خطا در به‌روزرسانی مکان انبار"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => WarehouseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("مکان انبار با موفقیت حذف شد");
    },
    onError: () => toast.error("خطا در حذف مکان انبار"),
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 0,
    },
  });

  const onSubmit = (formData: LocationFormValues) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (location: Warehouse) => {
    setEditingLocation(location);
    form.reset({
      name: location.name,
      address: location.address,
      capacity: location.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این مکان انبار اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const openNewDialog = () => {
    setEditingLocation(null);
    form.reset({
      name: "",
      address: "",
      capacity: 0,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 py-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مکان‌های انبار</h1>
          <p className="text-muted-foreground">مدیریت و سازماندهی مکان‌های نگهداری محصولات (صفحه‌بندی سمت سرور)</p>
        </div>
        <Button onClick={openNewDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          افزودن مکان جدید
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>مکان‌های انبار</CardTitle>
          <div className="relative flex items-center w-72">
            <PackageSearch className="h-4 w-4 text-muted-foreground absolute right-3 pointer-events-none" />
            <Input
              placeholder="جستجو در مکان‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام مکان</TableHead>
                  <TableHead>آدرس</TableHead>
                  <TableHead>ظرفیت</TableHead>
                  <TableHead>استفاده شده</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="p-4">
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      هیچ مکان انباری ثبت نشده است
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => {
                    const used = location.currentOccupancy ?? 0;
                    const usagePercent = location.capacity > 0 ? Math.round((used / location.capacity) * 100) : 0;
                    return (
                      <TableRow key={location.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{location.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.capacity.toLocaleString()} واحد</TableCell>
                        <TableCell>{used.toLocaleString()} واحد</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className={`h-2.5 rounded-full ${
                                usagePercent < 50 ? 'bg-green-500' :
                                usagePercent < 80 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            {usagePercent}% استفاده شده
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPageIndex}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPageIndex(1);
            }}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "ویرایش مکان انبار" : "افزودن مکان انبار جدید"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام مکان</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: انبار مرکزی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس</FormLabel>
                    <FormControl>
                      <Input placeholder="آدرس مکان را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ظرفیت (واحد)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {editingLocation ? "به‌روزرسانی" : "افزودن مکان"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
