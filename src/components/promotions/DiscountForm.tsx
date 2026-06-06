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
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PromotionService } from "@/services/promotion-service";
import { Loader2 } from "lucide-react";

const discountFormSchema = z
  .object({
    code: z.string().min(3, { message: "کد تخفیف باید حداقل ۳ کاراکتر باشد" }),
    discountType: z.enum(["percentage", "fixed"]),
    amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "مقدار تخفیف باید یک عدد مثبت باشد",
    }),
    startDate: z.date({ required_error: "تاریخ شروع الزامی است" }),
    endDate: z.date({ required_error: "تاریخ پایان الزامی است" }),
    minimumOrder: z.string().optional(),
    maxUsage: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
    path: ["endDate"],
  });

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountForm({ open, onOpenChange }: DiscountFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      amount: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      minimumOrder: "",
      maxUsage: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DiscountFormValues) =>
      PromotionService.createDiscount({
        code: data.code,
        discountType: data.discountType,
        amount: Number(data.amount),
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : undefined,
        maxUsage: data.maxUsage ? Number(data.maxUsage) : undefined,
        description: data.description,
        isActive: data.isActive,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast({
        title: "کد تخفیف ایجاد شد",
        description: `کد تخفیف ${vars.code} با موفقیت ایجاد شد.`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "خطا در ایجاد کد تخفیف",
        description: err?.response?.data?.message || err?.message || "خطای ناشناخته",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>ایجاد کد تخفیف جدید</DialogTitle>
          <DialogDescription>اطلاعات کد تخفیف جدید را وارد کنید.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4"
            dir="rtl"
          >
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          form.watch("discountType") === "percentage" ? "مثال: ۲۰" : "مثال: ۵۰۰۰۰"
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
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ شروع</FormLabel>
                    <FormControl>
                      <PersianDatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ پایان</FormLabel>
                    <FormControl>
                      <PersianDatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
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
                    <FormDescription>آیا این کد تخفیف فعال باشد؟</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                ایجاد کد تخفیف
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
