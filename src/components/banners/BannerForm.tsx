import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BannerService } from "@/services/banner-service";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Link2, LayoutTemplate, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BannerSize, BannerTargetLocation, BannerType } from "@/types/banner";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Please upload an image"),
  linkUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  targetLocation: z.string() as z.ZodType<BannerTargetLocation>,
  size: z.string() as z.ZodType<BannerSize>,
  type: z.string() as z.ZodType<BannerType>,
  active: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

interface BannerFormProps {
  onBannerAdded: () => void;
  initialData?: z.infer<typeof formSchema>;
}

export function BannerForm({ onBannerAdded, initialData }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      targetLocation: "homepage",
      size: "medium",
      type: "promotional",
      active: true,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleImageUpload = (imageUrl: string) => {
    form.setValue("imageUrl", imageUrl);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const bannerData = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        targetLocation: data.targetLocation as BannerTargetLocation,
        size: data.size as BannerSize,
        type: data.type as BannerType,
        active: data.active,
        startDate: data.startDate,
        endDate: data.endDate
      };
      
      await BannerService.createBanner(bannerData);
      toast.success("Banner created successfully!");
      form.reset();
      onBannerAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} dir="rtl" className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    عنوان بنر
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان بنر را وارد کنید" {...field} />
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
                    <Textarea 
                      placeholder="توضیحات بنر را وارد کنید (اختیاری)" 
                      className="resize-none min-h-[80px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    entityType="banner"
                    currentImage={field.value}
                    label="تصویر بنر"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Link2 className="h-4 w-4 ml-1 text-muted-foreground" />
                    لینک (اختیاری)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/landing-page" 
                      {...field}
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="targetLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <LayoutTemplate className="h-4 w-4 ml-1 text-muted-foreground" />
                    محل نمایش
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="محل نمایش بنر را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="homepage">صفحه اصلی</SelectItem>
                      <SelectItem value="product-list">لیست محصولات</SelectItem>
                      <SelectItem value="category-page">صفحات دسته‌بندی</SelectItem>
                      <SelectItem value="checkout">صفحه پرداخت</SelectItem>
                      <SelectItem value="all-pages">همه صفحات</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اندازه بنر</FormLabel>
                  <Select
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اندازه بنر را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">کوچک</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">بزرگ</SelectItem>
                      <SelectItem value="full-width">تمام عرض</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Megaphone className="h-4 w-4 ml-1 text-muted-foreground" />
                    نوع بنر
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="نوع بنر را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="promotional">تبلیغاتی</SelectItem>
                      <SelectItem value="informational">اطلاع‌رسانی</SelectItem>
                      <SelectItem value="seasonal">فصلی</SelectItem>
                      <SelectItem value="featured-product">محصول ویژه</SelectItem>
                      <SelectItem value="category-highlight">دسته‌بندی برجسته</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ شروع</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>انتخاب تاریخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>انتخاب تاریخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>وضعیت فعال</FormLabel>
                    <FormDescription>
                      نمایش بنر در سایت
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch dir="ltr"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          {isSubmitting ? "در حال ایجاد..." : "ایجاد بنر"}
        </Button>
      </form>
    </Form>
  );
}
