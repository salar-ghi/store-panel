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
import { PriceInput } from "@/components/ui/price-input";
import { formatPrice } from "@/lib/format";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PromotionService } from "@/services/promotion-service";
import { CategoryService } from "@/services/category-service";
import { BrandService } from "@/services/brand-service";
import { ProductService } from "@/services/product-service";
import { UserService } from "@/services/user-service";
import { MultiSelectCheckbox, MultiSelectItem } from "@/components/ui/multi-select-checkbox";
import { DiscountScopeLabels } from "@/lib/discount-eval";
import type { DiscountScopeType } from "@/types/promotion";
import { Loader2, Target, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScopePickerProps {
  label: string;
  isLoading: boolean;
  items: MultiSelectItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  emptyMessage?: string;
}

function ScopePicker({
  label,
  isLoading,
  items,
  selectedIds,
  onSelectionChange,
  emptyMessage = "موردی برای انتخاب وجود ندارد",
}: ScopePickerProps) {
  const selectedItems = items.filter((i) => selectedIds.includes(i.id));
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          در حال بارگذاری از سرور...
        </div>
      ) : (
        <>
          <MultiSelectCheckbox
            items={items}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            maxHeight="14rem"
            emptyMessage={emptyMessage}
            emptySubMessage=""
          />
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/40 p-2">
              {selectedItems.map((it) => (
                <Badge
                  key={it.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="max-w-[160px] truncate">{it.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectionChange(selectedIds.filter((id) => id !== it.id))
                    }
                    className="rounded-full p-0.5 hover:bg-background/60"
                    aria-label="حذف"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
    scopeType: z.enum(["all", "categories", "brands", "products", "users", "roles"]),
    scopeCategoryIds: z.array(z.string()).default([]),
    scopeBrandIds: z.array(z.string()).default([]),
    scopeProductIds: z.array(z.string()).default([]),
    scopeUserIds: z.array(z.string()).default([]),
    scopeRoleIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
    path: ["endDate"],
  })
  .refine(
    (d) => {
      switch (d.scopeType) {
        case "categories":
          return d.scopeCategoryIds.length > 0;
        case "brands":
          return d.scopeBrandIds.length > 0;
        case "products":
          return d.scopeProductIds.length > 0;
        case "users":
          return d.scopeUserIds.length > 0;
        case "roles":
          return d.scopeRoleIds.length > 0;
        default:
          return true;
      }
    },
    { message: "حداقل یک مورد را برای محدوده تخفیف انتخاب کنید", path: ["scopeType"] },
  );

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
      scopeType: "all",
      scopeCategoryIds: [],
      scopeBrandIds: [],
      scopeProductIds: [],
      scopeUserIds: [],
      scopeRoleIds: [],
    },
  });

  const scopeType = form.watch("scopeType");

  // Only fetch options needed by the current scope, but cache them.
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.getAllCategories(),
    enabled: open && scopeType === "categories",
    staleTime: 5 * 60 * 1000,
  });
  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => BrandService.getAll(),
    enabled: open && scopeType === "brands",
    staleTime: 5 * 60 * 1000,
  });
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
    enabled: open && scopeType === "products",
    staleTime: 5 * 60 * 1000,
  });
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.getAllUsers(),
    enabled: open && scopeType === "users",
    staleTime: 5 * 60 * 1000,
  });
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => UserService.getAllRoles(),
    enabled: open && scopeType === "roles",
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: DiscountFormValues) => {
      const scope =
        data.scopeType === "all"
          ? { type: "all" as DiscountScopeType }
          : data.scopeType === "categories"
          ? { type: "categories" as DiscountScopeType, categoryIds: data.scopeCategoryIds.map(Number) }
          : data.scopeType === "brands"
          ? { type: "brands" as DiscountScopeType, brandIds: data.scopeBrandIds.map(Number) }
          : data.scopeType === "products"
          ? { type: "products" as DiscountScopeType, productIds: data.scopeProductIds.map(Number) }
          : data.scopeType === "users"
          ? { type: "users" as DiscountScopeType, userIds: data.scopeUserIds }
          : { type: "roles" as DiscountScopeType, roleIds: data.scopeRoleIds };

      return PromotionService.createDiscount({
        code: data.code,
        discountType: data.discountType,
        amount: Number(data.amount),
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : undefined,
        maxUsage: data.maxUsage ? Number(data.maxUsage) : undefined,
        description: data.description,
        isActive: data.isActive,
        scope,
      });
    },
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
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
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
                render={({ field }) => {
                  const isPercent = form.watch("discountType") === "percentage";
                  return (
                    <FormItem>
                      <FormLabel>مقدار تخفیف</FormLabel>
                      <FormControl>
                        {isPercent ? (
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="مثال: 20"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        ) : (
                          <PriceInput
                            value={field.value ? Number(field.value) : undefined}
                            onChange={(n) => field.onChange(String(n))}
                            placeholder="مثال: 50,000"
                          />
                        )}
                      </FormControl>
                      {!isPercent && field.value ? (
                        <FormDescription className="text-[11px]">
                          {formatPrice(Number(field.value) || 0)}
                        </FormDescription>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                      <PriceInput
                        value={field.value ? Number(field.value) : undefined}
                        onChange={(n) => field.onChange(String(n))}
                        placeholder="اختیاری"
                      />
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
                      <Input type="number" min={1} placeholder="اختیاری" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- Scope / eligibility --- */}
            <Card className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">محدوده اعمال تخفیف</p>
              </div>

              <FormField
                control={form.control}
                name="scopeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>این کد تخفیف روی چه چیزی اعمال شود؟</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(DiscountScopeLabels) as DiscountScopeType[]).map(
                          (k) => (
                            <SelectItem key={k} value={k}>
                              {DiscountScopeLabels[k]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scopeType === "categories" && (
                <FormField
                  control={form.control}
                  name="scopeCategoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <ScopePicker
                        label="دسته‌بندی‌های مشمول (از دسته‌های ثبت‌شده در سرور)"
                        isLoading={loadingCategories}
                        items={categories.map((c) => ({
                          id: String(c.id),
                          name: c.name,
                          description: c.description,
                        }))}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        emptyMessage="دسته‌بندی‌ای در سرور یافت نشد"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scopeType === "brands" && (
                <FormField
                  control={form.control}
                  name="scopeBrandIds"
                  render={({ field }) => (
                    <FormItem>
                      <ScopePicker
                        label="برندهای مشمول (از برندهای ثبت‌شده در سرور)"
                        isLoading={loadingBrands}
                        items={brands.map((b) => ({
                          id: String(b.id),
                          name: b.name,
                          description: b.description,
                        }))}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        emptyMessage="برندی در سرور یافت نشد"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scopeType === "products" && (
                <FormField
                  control={form.control}
                  name="scopeProductIds"
                  render={({ field }) => (
                    <FormItem>
                      <ScopePicker
                        label="محصولات مشمول (از محصولات ثبت‌شده در سرور)"
                        isLoading={loadingProducts}
                        items={products.map((p) => ({
                          id: String(p.id),
                          name: p.name,
                          description: `${p.categoryName ?? ""} - ${p.brandName ?? ""}`,
                        }))}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        emptyMessage="محصولی در سرور یافت نشد"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scopeType === "users" && (
                <FormField
                  control={form.control}
                  name="scopeUserIds"
                  render={({ field }) => (
                    <FormItem>
                      <ScopePicker
                        label="کاربران مشمول (از کاربران ثبت‌شده در سرور)"
                        isLoading={loadingUsers}
                        items={users.map((u) => ({
                          id: u.id,
                          name: `${u.firstName} ${u.lastName}`,
                          description: u.phoneNumber,
                        }))}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        emptyMessage="کاربری در سرور یافت نشد"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scopeType === "roles" && (
                <FormField
                  control={form.control}
                  name="scopeRoleIds"
                  render={({ field }) => (
                    <FormItem>
                      <ScopePicker
                        label="گروه‌های کاربری مشمول (مثلاً VIP، عمده‌فروش)"
                        isLoading={loadingRoles}
                        items={roles.map((r) => ({ id: r.id, name: r.name }))}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        emptyMessage="گروهی در سرور یافت نشد"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Card>

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
