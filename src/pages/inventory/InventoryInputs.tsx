
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Calendar, Truck, FileText, Printer, Download, Filter, Plus } from "lucide-react";
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
  FormDescription
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Mock data for inventory inputs
const mockInputs = [
  { id: "INV-001", date: "1402/02/15", supplier: "شرکت آسیا تک", location: "انبار مرکزی", items: 12, status: "تکمیل شده" },
  { id: "INV-002", date: "1402/02/18", supplier: "پارس نوین", location: "انبار شرق", items: 8, status: "در انتظار تایید" },
  { id: "INV-003", date: "1402/02/20", supplier: "بازرگانی آریا", location: "انبار مرکزی", items: 5, status: "تکمیل شده" },
  { id: "INV-004", date: "1402/02/22", supplier: "شرکت آسیا تک", location: "انبار غرب", items: 15, status: "تکمیل شده" },
  { id: "INV-005", date: "1402/02/25", supplier: "کالای دیجیتال سام", location: "انبار شمال", items: 10, status: "در انتظار تایید" },
];

// Mock data for locations
const locations = [
  { id: 1, name: "انبار مرکزی" },
  { id: 2, name: "انبار شرق" },
  { id: 3, name: "انبار غرب" },
  { id: 4, name: "انبار شمال" },
  { id: 5, name: "انبار جنوب" },
];

// Mock data for suppliers
const suppliers = [
  { id: 1, name: "شرکت آسیا تک" },
  { id: 2, name: "پارس نوین" },
  { id: 3, name: "بازرگانی آریا" },
  { id: 4, name: "کالای دیجیتال سام" },
];

const inputFormSchema = z.object({
  supplier: z.string({ required_error: "تامین‌کننده را انتخاب کنید" }),
  location: z.string({ required_error: "مکان انبار را انتخاب کنید" }),
  items: z.coerce.number().positive({ message: "تعداد اقلام باید عدد مثبت باشد" }),
  notes: z.string().optional(),
});

type InputFormValues = z.infer<typeof inputFormSchema>;

export default function InventoryInputs() {
  const [inputs, setInputs] = useState(mockInputs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const form = useForm<InputFormValues>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      supplier: "",
      location: "",
      items: 1,
      notes: "",
    },
  });

  const onSubmit = (data: InputFormValues) => {
    // Generate a new input entry
    const newInput = {
      id: `INV-${String(inputs.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('fa-IR'),
      supplier: suppliers.find(s => s.id.toString() === data.supplier)?.name || data.supplier,
      location: locations.find(l => l.id.toString() === data.location)?.name || data.location,
      items: data.items,
      status: "در انتظار تایید",
    };

    setInputs([...inputs, newInput]);
    toast.success("ورودی انبار با موفقیت ثبت شد");
    setIsDialogOpen(false);
    form.reset();
  };

  const filteredInputs = filter === "all" 
    ? inputs 
    : inputs.filter((input) => input.status === filter);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ثبت ورودی انبار</h1>
          <p className="text-muted-foreground">مدیریت ورودی‌های محصولات به انبار</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          ثبت ورودی جدید
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="text-center">خلاصه وضعیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span>کل ورودی‌ها:</span>
              <span className="font-bold">{inputs.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span>تکمیل شده:</span>
              <span className="font-bold text-green-600">
                {inputs.filter(input => input.status === "تکمیل شده").length}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span>در انتظار تایید:</span>
              <span className="font-bold text-amber-600">
                {inputs.filter(input => input.status === "در انتظار تایید").length}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span>مجموع اقلام:</span>
              <span className="font-bold text-blue-600">
                {inputs.reduce((sum, input) => sum + input.items, 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>لیست ورودی‌های انبار</CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="فیلتر بر اساس وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه ورودی‌ها</SelectItem>
                  <SelectItem value="تکمیل شده">تکمیل شده</SelectItem>
                  <SelectItem value="در انتظار تایید">در انتظار تایید</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شناسه</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>تامین‌کننده</TableHead>
                    <TableHead>مکان انبار</TableHead>
                    <TableHead>تعداد اقلام</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInputs.map((input) => (
                    <TableRow key={input.id}>
                      <TableCell className="font-medium">{input.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {input.date}
                        </div>
                      </TableCell>
                      <TableCell>{input.supplier}</TableCell>
                      <TableCell>{input.location}</TableCell>
                      <TableCell>{input.items}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          input.status === "تکمیل شده" 
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {input.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="مشاهده جزئیات">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="چاپ رسید">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredInputs.length === 0 && (
                <div className="py-6 text-center text-muted-foreground">
                  هیچ ورودی‌ای با این وضعیت پیدا نشد
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                دانلود گزارش
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>ثبت ورودی جدید به انبار</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-lg">
                <Truck className="h-5 w-5 ml-3" />
                <div className="text-sm">ثبت ورودی جدید به معنای افزایش موجودی کالا در انبار است.</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تامین‌کننده</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب تامین‌کننده" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مکان انبار</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب مکان انبار" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تعداد اقلام</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      تعداد کل اقلام ورودی در این محموله را وارد کنید
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>یادداشت (اختیاری)</FormLabel>
                    <FormControl>
                      <Input placeholder="یادداشت یا توضیحات اضافی..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="mt-4">
                  ثبت ورودی
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
