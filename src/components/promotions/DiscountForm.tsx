
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format, parse } from "date-fns";

const discountFormSchema = z.object({
  code: z.string().min(3, {
    message: "کد تخفیف باید حداقل ۳ کاراکتر باشد",
  }),
  discountType: z.enum(["percentage", "fixed"]),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "مقدار تخفیف باید یک عدد مثبت باشد",
  }),
  startDate: z.string().min(1, {
    message: "تاریخ شروع الزامی است",
  }),
  endDate: z.string().min(1, {
    message: "تاریخ پایان الزامی است",
  }),
  minimumOrder: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  maxUsage: z.string().optional(),
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountForm({ open, onOpenChange }: DiscountFormProps) {
  const { toast } = useToast();

  const formatPersianDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      // Convert to Persian-friendly format (just for display purposes)
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // Format as YYYY/MM/DD for Persian display
      return `${year}/${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateStr;
    }
  };

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      amount: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      minimumOrder: "",
      description: "",
      isActive: true,
      maxUsage: "",
    },
  });

  function onSubmit(data: DiscountFormValues) {
    // Format dates for display
    const formattedData = {
      ...data,
      startDate: formatPersianDate(data.startDate),
      endDate: formatPersianDate(data.endDate),
    };
    
    toast({
      title: "کد تخفیف ایجاد شد",
      description: `کد تخفیف ${data.code} با موفقیت ایجاد شد.`,
    });
    console.log(formattedData);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ایجاد کد تخفیف جدید</DialogTitle>
          <DialogDescription>
            اطلاعات کد تخفیف جدید را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کد تخفیف</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: SUMMER50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع تخفیف</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع تخفیف را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">درصدی</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقدار تخفیف</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={
                          form.watch("discountType") === "percentage"
                            ? "مثال: ۲۰"
                            : "مثال: ۵۰۰۰۰"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ شروع</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value ? formatPersianDate(field.value) : ''}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ پایان</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value ? formatPersianDate(field.value) : ''}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداقل سفارش (تومان)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="اختیاری" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداکثر استفاده</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="اختیاری" {...field} />
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
                      placeholder="توضیحات تخفیف را وارد کنید..."
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>فعال</FormLabel>
                    <FormDescription>
                      آیا این کد تخفیف فعال باشد؟
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">ایجاد کد تخفیف</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
