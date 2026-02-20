
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Megaphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import { BannerSize, BannerType, BannerSizeLabels, BannerTypeLabels, BannerPageCodeLabels, Banner, CreateBannerRequest } from "@/types/banner";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  name: z.string().min(2, "نام بنر الزامی است"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "تصویر بنر الزامی است"),
  altText: z.string().optional(),
  link: z.string().url("لینک معتبر وارد کنید").optional().or(z.literal("")),
  callToActionText: z.string().optional(),
  type: z.coerce.number() as z.ZodType<BannerType>,
  size: z.coerce.number() as z.ZodType<BannerSize>,
  priority: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  placementIds: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface BannerFormProps {
  onSuccess: () => void;
  initialData?: Banner;
}

export function BannerForm({ onSuccess, initialData }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const { data: placements } = useQuery({
    queryKey: ["banner-placements"],
    queryFn: BannerService.getAllPlacements,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          imageUrl: initialData.imageUrl,
          altText: initialData.altText || "",
          link: initialData.link || "",
          callToActionText: initialData.callToActionText || "",
          type: initialData.type,
          size: initialData.size,
          priority: initialData.priority,
          isActive: initialData.isActive,
          startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
          endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
          placementIds: initialData.placements?.map((p) => p.id) || [],
        }
      : {
          name: "",
          description: "",
          imageUrl: "",
          altText: "",
          link: "",
          callToActionText: "",
          type: 1 as BannerType,
          size: 1 as BannerSize,
          priority: 0,
          isActive: true,
          startDate: undefined,
          endDate: undefined,
          placementIds: [],
        },
  });

  const handleImageUpload = (base64: string) => {
    form.setValue("imageUrl", base64);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateBannerRequest = {
        name: data.name,
        description: data.description || undefined,
        imageUrl: data.imageUrl,
        altText: data.altText || undefined,
        link: data.link || undefined,
        callToActionText: data.callToActionText || undefined,
        type: data.type,
        size: data.size,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        placementIds: data.placementIds,
      };

      if (isEditMode && initialData) {
        await BannerService.updateBanner(initialData.id, payload);
        toast.success("بنر با موفقیت بروزرسانی شد");
      } else {
        await BannerService.createBanner(payload);
        toast.success("بنر با موفقیت ایجاد شد");
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ذخیره بنر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlacement = (placementId: number, checked: boolean) => {
    const current = form.getValues("placementIds");
    if (checked) {
      form.setValue("placementIds", [...current, placementId]);
    } else {
      form.setValue("placementIds", current.filter((id) => id !== placementId));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} dir="rtl" className="space-y-5 pt-2 max-h-[75vh] overflow-y-auto px-1">
        {/* Name & Description */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام بنر</FormLabel>
                <FormControl>
                  <Input placeholder="عنوان بنر" {...field} />
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
                  <Textarea placeholder="توضیحات (اختیاری)" className="resize-none min-h-[70px]" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload */}
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

        {/* Alt text & CTA */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="altText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>متن جایگزین تصویر</FormLabel>
                <FormControl>
                  <Input placeholder="alt text" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="callToActionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>متن دکمه</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: خرید کنید" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Link */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                لینک (اختیاری)
              </FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type, Size, Priority */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  نوع بنر
                </FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BannerTypeLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
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
                <FormLabel>اندازه</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BannerSizeLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اولویت</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاریخ شروع</FormLabel>
                <FormControl>
                  <PersianDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="انتخاب تاریخ شروع"
                  />
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
                  <PersianDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="انتخاب تاریخ پایان"
                    disabledDate={(date) => {
                      const start = form.getValues("startDate");
                      return start ? date < start : false;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Placements */}
        <div className="space-y-3">
          <FormLabel>جایگاه‌های نمایش</FormLabel>
          {!placements?.length ? (
            <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">
              جایگاهی تعریف نشده است
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {placements.map((p) => {
                const isChecked = form.watch("placementIds").includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                      isChecked
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => togglePlacement(p.id, !!checked)}
                    />
                    <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{BannerPageCodeLabels[p.code] || p.code}</div>
                    </div>
                    {p.recommendedSize && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {p.recommendedSize}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Active switch */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>وضعیت فعال</FormLabel>
                <FormDescription>نمایش بنر در سایت</FormDescription>
              </div>
              <FormControl>
                <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          {isEditMode ? "بروزرسانی بنر" : "ایجاد بنر"}
        </Button>
      </form>
    </Form>
  );
}
