
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, X, Package, Trash2, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import { ProductImageUpload } from "./ProductImageUpload";
import { SelectFields } from "./SelectFields";
import { ProductTagSelect } from "./ProductTagSelect";
import { ProductVariantEditor } from "./ProductVariantEditor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CreateProductRequest, 
  ProductAttribute, 
  WeightUnit, 
  QuantityUnit, 
  DimensionUnit, 
  ProductStatus, 
  ProductAvailability,
  ProductVariant,
  SalesMode,
} from "@/types/product";
import { StorageService } from "@/services/storage-service";
import { Warehouse, Scale } from "lucide-react";
import { StorageLocationPicker } from "./StorageLocationPicker";
import { PriceInput } from "@/components/ui/price-input";
import { formatPrice, formatPersianNumber } from "@/lib/format";

// Weight unit options
const weightUnits: { value: WeightUnit; label: string }[] = [
  { value: 'gram', label: 'گرم (g)' },
  { value: 'kilogram', label: 'کیلوگرم (kg)' },
  { value: 'mithqal', label: 'مثقال' },
  { value: 'ounce', label: 'اونس (oz)' },
  { value: 'pound', label: 'پوند (lb)' },
];

// Quantity unit options
const quantityUnits: { value: QuantityUnit; label: string }[] = [
  { value: 'piece', label: 'عدد' },
  { value: 'box', label: 'جعبه' },
  { value: 'pack', label: 'بسته' },
  { value: 'carton', label: 'کارتن' },
  { value: 'dozen', label: 'دوجین (۱۲ عدد)' },
  { value: 'pair', label: 'جفت' },
  { value: 'set', label: 'ست' },
  { value: 'liter', label: 'لیتر' },
  { value: 'milliliter', label: 'میلی‌لیتر' },
];

// Dimension unit options
const dimensionUnits: { value: DimensionUnit; label: string }[] = [
  { value: 'cm', label: 'سانتی‌متر (cm)' },
  { value: 'm', label: 'متر (m)' },
  { value: 'mm', label: 'میلی‌متر (mm)' },
  { value: 'inch', label: 'اینچ (in)' },
  { value: 'ft', label: 'فوت (ft)' },
];

// Currency options
const currencies = [
  { value: 'IRR', label: 'ریال ایران (IRR)' },
  { value: 'IRT', label: 'تومان ایران (IRT)' },
  { value: 'USD', label: 'دلار آمریکا (USD)' },
  { value: 'EUR', label: 'یورو (EUR)' },
  { value: 'GBP', label: 'پوند (GBP)' },
  { value: 'AED', label: 'درهم امارات (AED)' },
];

// Status options
const statusOptions: { value: ProductStatus; label: string; description: string }[] = [
  { value: 'active', label: 'فعال', description: 'محصول قابل فروش و نمایش است' },
  { value: 'inactive', label: 'غیرفعال', description: 'محصول موقتاً غیرفعال است' },
];

// Availability options
const availabilityOptions: { value: ProductAvailability; label: string; description: string }[] = [
  { value: 'available', label: 'موجود', description: 'محصول در دسترس است' },
  { value: 'unavailable', label: 'ناموجود', description: 'موقتاً ناموجود' },
  { value: 'out_of_stock', label: 'تمام شده', description: 'موجودی صفر شده' },
  { value: 'discontinued', label: 'متوقف شده', description: 'تولید متوقف شده' },
  { value: 'draft', label: 'پیش‌نویس', description: 'در حال آماده‌سازی' },
];

const dimensionSchema = z.object({
  length: z.coerce.number().nonnegative({ message: "طول باید عدد مثبت باشد." }),
  width: z.coerce.number().nonnegative({ message: "عرض باید عدد مثبت باشد." }),
  height: z.coerce.number().nonnegative({ message: "ارتفاع باید عدد مثبت باشد." }),
  weight: z.coerce.number().nonnegative({ message: "وزن باید عدد مثبت باشد." }),
  dimensionUnit: z.enum(['cm', 'm', 'mm', 'inch', 'ft']),
  weightUnit: z.enum(['gram', 'kilogram', 'mithqal', 'ounce', 'pound']),
});

const stockSchema = z.object({
  quantity: z.coerce.number().nonnegative({ message: "تعداد باید عدد غیرمنفی باشد." }),
  reorderThreshold: z.coerce.number().int().nonnegative({ message: "حد سفارش مجدد باید عدد صحیح غیرمنفی باشد." }),
  spaceId: z.coerce.number({ required_error: "لطفا فضای ذخیره‌سازی را انتخاب کنید." }).int().positive({ message: "لطفا فضای ذخیره‌سازی را انتخاب کنید." }),
  zoneId: z.coerce.number().int().optional(),
  shelfId: z.coerce.number({ required_error: "لطفا قفسه را انتخاب کنید." }).int().positive({ message: "لطفا قفسه را انتخاب کنید." }),
  quantityUnit: z.enum(['piece', 'box', 'pack', 'carton', 'dozen', 'pair', 'set', 'liter', 'milliliter']),
});

const priceSchema = z.object({
  batchNumber: z.string().optional(),
  amount: z.coerce.number().positive({ message: "قیمت فروش باید عدد مثبت باشد." }),
  costPrice: z.coerce.number().nonnegative({ message: "قیمت خرید باید عدد غیرمنفی باشد." }),
  currency: z.string().min(1, { message: "لطفا واحد پول را انتخاب کنید." }),
  pricingTier: z.enum(['retail', 'wholesale', 'discount', 'premium']),
  effectiveDate: z.string().min(1, { message: "تاریخ شروع اعتبار الزامی است." }),
  expiryDate: z.string().optional(),
  quantity: z.coerce.number().positive({ message: "تعداد وارده باید عدد مثبت باشد." }),
  soldQuantity: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

const salesUnitSchema = z.object({
  mode: z.enum(['piece', 'weight', 'both']).default('piece'),
  weightUnit: z.enum(['gram', 'kilogram', 'mithqal', 'ounce', 'pound']).optional(),
  pricePerWeightUnit: z.coerce.number().nonnegative().optional(),
  packWeight: z.coerce.number().nonnegative().optional(),
  packLabel: z.string().optional(),
}).optional();

const formSchema = z.object({
  name: z.string().min(2, { message: "نام محصول باید حداقل ۲ کاراکتر باشد." }),
  description: z.string().min(5, { message: "توضیحات باید حداقل ۵ کاراکتر باشد." }),
  categoryId: z.coerce.number({ required_error: "لطفا دسته‌بندی را انتخاب کنید." }),
  brandId: z.coerce.number({ required_error: "لطفا برند را انتخاب کنید." }),
  supplierId: z.coerce.number({ required_error: "لطفا تأمین‌کننده را انتخاب کنید." }),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  availability: z.enum(['available', 'unavailable', 'discontinued', 'draft', 'out_of_stock']).optional(),
  dimensions: dimensionSchema.optional(),
  stock: stockSchema.optional(),
  prices: z.array(priceSchema).optional(),
  attributes: z.array(
    z.object({
      key: z.string().min(1, { message: "نام ویژگی نمی‌تواند خالی باشد." }),
      value: z.string().min(1, { message: "مقدار ویژگی نمی‌تواند خالی باشد." })
    })
  ).optional(),
  pricingStrategy: z.enum(['fifo', 'latest', 'average']).optional(),
  salesUnit: salesUnitSchema,
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: CreateProductRequest) => void;
  initialData?: Partial<CreateProductRequest>;
  isEditMode?: boolean;
}

export function ProductForm({ onSubmit, initialData, isEditMode = false }: ProductFormProps) {
  const [productImages, setProductImages] = useState<string[]>(initialData?.images || []);
  const [coverImage, setCoverImage] = useState<string>(
    initialData?.coverImage || initialData?.images?.[0] || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(initialData?.attributes || []);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [activeTab, setActiveTab] = useState("basic");

  const { data: spaces = [] } = useQuery({
    queryKey: ['storage', 'spaces'],
    queryFn: () => StorageService.getSpaces(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId,
      brandId: initialData?.brandId,
      supplierId: initialData?.supplierId,
      images: initialData?.images || [],
      tags: initialData?.tags || [],
      reorderLevel: initialData?.reorderLevel || 0,
      location: initialData?.location || "",
      status: initialData?.status || 'active',
      availability: initialData?.availability || 'draft',
      dimensions: initialData?.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        dimensionUnit: "cm",
        weightUnit: "gram"
      },
      stock: initialData?.stock ? {
        quantity: initialData.stock.quantity ?? 0,
        reorderThreshold: initialData.stock.reorderThreshold ?? 0,
        spaceId: initialData.stock.spaceId ?? 0,
        zoneId: initialData.stock.zoneId,
        shelfId: initialData.stock.shelfId ?? 0,
        quantityUnit: initialData.stock.quantityUnit ?? "piece",
      } : {
        quantity: 0,
        reorderThreshold: 0,
        spaceId: 0,
        zoneId: undefined,
        shelfId: 0,
        quantityUnit: "piece",
      },
      prices: initialData?.prices || [{
        batchNumber: `BATCH-${Date.now()}`,
        amount: 0,
        costPrice: 0,
        currency: "IRR",
        pricingTier: "retail",
        effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
        quantity: 0,
        soldQuantity: 0,
        notes: ""
      }],
      attributes: initialData?.attributes || [],
      pricingStrategy: initialData?.pricingStrategy || 'fifo',
      salesUnit: initialData?.salesUnit || { mode: 'piece', weightUnit: 'kilogram' },
    },
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control: form.control,
    name: "prices"
  });

  const handleSubmit = (data: FormData) => {
    const resolvedCover = coverImage && productImages.includes(coverImage)
      ? coverImage
      : productImages[0];

    const productData: CreateProductRequest = {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId,
      supplierId: data.supplierId,
      images: productImages,
      coverImage: resolvedCover,
      tags: selectedTags,
      attributes: attributes,
      location: data.location,
      reorderLevel: data.reorderLevel,
      status: data.status,
      availability: data.availability,
      dimensions: data.dimensions ? {
        length: data.dimensions.length,
        width: data.dimensions.width,
        height: data.dimensions.height,
        weight: data.dimensions.weight,
        dimensionUnit: data.dimensions.dimensionUnit,
        weightUnit: data.dimensions.weightUnit,
      } : undefined,
      stock: data.stock ? {
        quantity: data.stock.quantity,
        reorderThreshold: data.stock.reorderThreshold,
        spaceId: data.stock.spaceId,
        zoneId: data.stock.zoneId,
        shelfId: data.stock.shelfId,
        quantityUnit: data.stock.quantityUnit,
      } : undefined,
      prices: data.prices ? data.prices.map(price => ({
        batchNumber: price.batchNumber,
        amount: price.amount,
        costPrice: price.costPrice,
        currency: price.currency,
        pricingTier: price.pricingTier,
        effectiveDate: price.effectiveDate,
        expiryDate: price.expiryDate,
        quantity: price.quantity,
        soldQuantity: price.soldQuantity || 0,
        notes: price.notes,
      })) : undefined,
      variants: variants.length > 0 ? variants : undefined,
      pricingStrategy: data.pricingStrategy,
      salesUnit: data.salesUnit
        ? { ...data.salesUnit, mode: data.salesUnit.mode ?? 'piece' }
        : undefined,
    };
    
    onSubmit(productData);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleAddPriceBatch = () => {
    appendPrice({
      batchNumber: `BATCH-${Date.now()}`,
      amount: 0,
      costPrice: 0,
      currency: "IRR",
      pricingTier: "retail",
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      quantity: 0,
      soldQuantity: 0,
      notes: ""
    });
  };

  const getTotalStock = () => {
    const prices = form.watch("prices") || [];
    return prices.reduce((sum, p) => sum + (p.quantity || 0) - (p.soldQuantity || 0), 0);
  };

  // ---- Wizard step configuration ----
  type StepKey = "basic" | "inventory" | "dimensions" | "pricing" | "variants" | "attributes";
  const steps: {
    key: StepKey;
    label: string;
    fields: (keyof FormData | string)[];
  }[] = [
    {
      key: "basic",
      label: "اطلاعات اولیه",
      fields: ["name", "description", "categoryId", "brandId", "supplierId", "status", "availability"],
    },
    {
      key: "inventory",
      label: "موجودی و انبار",
      fields: ["stock.quantityUnit", "stock.quantity", "stock.reorderThreshold", "stock.spaceId", "stock.shelfId"],
    },
    {
      key: "dimensions",
      label: "ابعاد و وزن",
      fields: [
        "dimensions.length", "dimensions.width", "dimensions.height", "dimensions.weight",
        "dimensions.dimensionUnit", "dimensions.weightUnit",
      ],
    },
    {
      key: "pricing",
      label: "قیمت و سری ورود",
      fields: ["prices"],
    },
    { key: "variants", label: "متغیرها", fields: [] },
    { key: "attributes", label: "ویژگی‌ها", fields: [] },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === activeTab);
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const goToStep = (key: StepKey) => setActiveTab(key);

  const handleNext = async () => {
    const step = steps[currentStepIndex];
    const fields = step.fields as any[];
    const valid = fields.length === 0 ? true : await form.trigger(fields, { shouldFocus: true });
    if (!valid) {
      const errs = form.formState.errors as any;
      const missing: string[] = [];
      fields.forEach((f) => {
        const path = String(f).split(".");
        let cur: any = errs;
        for (const p of path) cur = cur?.[p];
        if (cur?.message) missing.push(cur.message);
      });
      toast.error(`لطفاً فیلدهای ضروری «${step.label}» را تکمیل کنید`, {
        description: missing.slice(0, 3).join(" • ") || "برخی فیلدها نامعتبر هستند.",
      });
      return;
    }
    setActiveTab(steps[currentStepIndex + 1].key);
  };

  const handlePrev = () => {
    if (!isFirstStep) setActiveTab(steps[currentStepIndex - 1].key);
  };

  // Validate every step before final submit
  const handleFinalSubmit = form.handleSubmit(handleSubmit, (errors) => {
    // find first step with an error and jump there
    const firstBadStep = steps.find((s) =>
      s.fields.some((f) => {
        const path = String(f).split(".");
        let cur: any = errors;
        for (const p of path) cur = cur?.[p];
        return !!cur;
      })
    );
    if (firstBadStep) {
      setActiveTab(firstBadStep.key);
      toast.error(`فیلدهای ضروری در مرحله «${firstBadStep.label}» تکمیل نشده است`, {
        description: "لطفاً موارد قرمز رنگ را اصلاح کنید.",
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFinalSubmit} className="space-y-6" dir="rtl">
        {/* Enterprise stepper */}
        <div className="sticky top-0 z-10 -mx-6 px-6 pt-1 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">مرحله</span>
              <span className="font-semibold text-foreground">{currentStepIndex + 1}</span>
              <span className="text-muted-foreground">از {steps.length}</span>
              <span className="mx-2 text-border">|</span>
              <span className="font-medium text-foreground">{steps[currentStepIndex].label}</span>
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
            </div>
          </div>
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        </div>


        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StepKey)} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-6 mb-6 h-auto bg-muted/40 p-1">
            {steps.map((s, idx) => {
              const done = idx < currentStepIndex;
              const active = idx === currentStepIndex;
              return (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="gap-1.5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <span
                    className={
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors " +
                      (active
                        ? "bg-primary text-primary-foreground"
                        : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {done ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline text-xs">{s.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-5">
            {/* Section: Identity */}
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  اطلاعات شناسایی
                </CardTitle>
                <CardDescription>نام و توضیحات محصول</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام محصول</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: گوشی سامسونگ گلکسی S24" {...field} />
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
                          placeholder="توضیحات کامل محصول..."
                          className="min-h-[110px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section: Status */}
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  وضعیت محصول
                </CardTitle>
                <CardDescription>وضعیت فعالیت و موجودی محصول را تعیین کنید</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وضعیت فعالیت</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب وضعیت" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وضعیت موجودی</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب وضعیت" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section: Classification */}
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  دسته‌بندی و برند
                </CardTitle>
                <CardDescription>دسته، برند و تأمین‌کننده محصول</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectFields control={form.control} />
              </CardContent>
            </Card>

            {/* Section: Images */}
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  گالری تصاویر
                </CardTitle>
                <CardDescription>
                  حداکثر ۵ تصویر آپلود کنید. روی هر تصویر کلیک کنید تا به عنوان «تصویر اصلی» انتخاب شود.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductImageUpload
                  value={productImages}
                  onChange={setProductImages}
                  coverImage={coverImage}
                  onCoverChange={setCoverImage}
                  maxImages={5}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Inventory — Storage Hierarchy (Space → Zone → Shelf) */}
          <TabsContent value="inventory" className="space-y-5">
            {/* Explainer */}
            <Card className="bg-muted/30 border-dashed shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  محل نگهداری محصول در ساختار انبار
                </CardTitle>
                <CardDescription className="leading-6">
                  محل دقیق این محصول را در سلسله‌مراتب <strong>فضای ذخیره‌سازی ← بخش (اختیاری) ← قفسه</strong> مشخص کنید.
                  این ساختار برای سوپرمارکت کوچک، فروشگاه زنجیره‌ای با زیرزمین و انبار آنلاین (Dark Store) یکسان کار می‌کند
                  و به مسئول انبار کمک می‌کند سریع کالا را پیدا کند.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Section 1: Counting unit & quantities */}
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  واحد و موجودی
                </CardTitle>
                <CardDescription>واحد شمارش، موجودی اولیه و آستانه هشدار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stock.quantityUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد شمارش</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب واحد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quantityUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>عدد، جعبه، بسته، لیتر …</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span>موجودی اولیه</span>
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            از سری‌ها محاسبه می‌شود
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step="any"
                            value={getTotalStock()}
                            readOnly
                            className="bg-muted/40 cursor-not-allowed"
                          />
                        </FormControl>
                        <FormDescription>
                          مجموع «تعداد وارده − فروخته‌شده» همه سری‌های مرحله ۴ (قیمت و سری ورود).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="stock.reorderThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد هشدار سفارش مجدد</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={1} {...field} />
                        </FormControl>
                        <FormDescription>هنگام رسیدن به این عدد اطلاع‌رسانی می‌شود</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Storage location (Space → Zone → Shelf) */}
            <StorageLocationPicker form={form} spaces={spaces} />
          </TabsContent>

          {/* Tab 3: Dimensions & Weight */}
          <TabsContent value="dimensions" className="space-y-5">
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base">ابعاد و وزن محصول</CardTitle>
                <CardDescription>
                  واحد اندازه‌گیری ابعاد و وزن را برای حمل، بسته‌بندی و چیدمان قفسه مشخص کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions.dimensionUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد ابعاد (طول، عرض، ارتفاع)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب واحد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dimensionUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensions.weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد وزن</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب واحد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {weightUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>طول</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensions.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عرض</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensions.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ارتفاع</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensions.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وزن</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Pricing & Import Batches */}
          <TabsContent value="pricing" className="space-y-5">
            {/* Explainer card: how batch/lot pricing works */}
            <Card className="bg-muted/30 border-dashed shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  مدیریت قیمت بر اساس سری ورود (Batch / Lot)
                </CardTitle>
                <CardDescription className="leading-6">
                  هر بار که محصول جدید وارد انبار می‌شود (مثلاً ۱۰۰۰۰ عدد کوکاکولا با قیمت خرید ۲ دلار)
                  یک <strong>«سری ورود»</strong> جدید ثبت کنید. سری بعدی (مثلاً ۵۰۰۰ عدد با قیمت ۲.۵ دلار)
                  هیچ تداخلی با سری قبلی ندارد. سیستم به‌صورت <strong>FIFO</strong> ابتدا موجودی سری‌های قدیمی‌تر را
                  می‌فروشد و قیمت فروش هر سری مستقل است. این روش برای سوپرمارکت کوچک، فروشگاه زنجیره‌ای و
                  فروشگاه آنلاین یکسان کار می‌کند.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Per-product pricing strategy across multiple batches */}
            <FormField
              control={form.control}
              name="pricingStrategy"
              render={({ field }) => (
                <FormItem>
                  <Card className="shadow-none">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base">روش نمایش قیمت بین سری‌ها</CardTitle>
                      <CardDescription>
                        وقتی چند سری با قیمت‌های متفاوت برای این محصول دارید، قیمت فروش بر اساس کدام سری نمایش داده شود؟
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select onValueChange={field.onChange} value={field.value || 'fifo'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fifo">اولین ورودی، اولین خروج (FIFO) — توصیه‌شده</SelectItem>
                          <SelectItem value="latest">آخرین قیمت ثبت‌شده</SelectItem>
                          <SelectItem value="average">میانگین وزنی موجودی</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />

            <Card className="shadow-none">

              <CardHeader className="py-4 flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    سری‌های وارداتی و قیمت‌گذاری
                  </CardTitle>
                  <CardDescription>
                    هر سری ورود کالا با قیمت و تعداد مختلف ثبت می‌شود و از موجودی و قیمت قبلی جدا است
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    موجودی کل: {getTotalStock()}
                  </Badge>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPriceBatch}>
                    <Plus className="h-4 w-4 ml-1" />
                    افزودن سری جدید
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {priceFields.map((field, index) => (
                  <Card key={field.id} className="border-dashed">
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">سری {index + 1}</Badge>
                        <FormField
                          control={form.control}
                          name={`prices.${index}.batchNumber`}
                          render={({ field }) => (
                            <Input 
                              placeholder="شماره سری" 
                              className="w-40 h-8" 
                              {...field} 
                            />
                          )}
                        />
                      </div>
                      {priceFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrice(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`prices.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تعداد وارده</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" min={0} step={1} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.soldQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تعداد فروخته شده</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" min={0} step={1} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.costPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>قیمت خرید (تمام شده)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>قیمت فروش</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" min={0} step={0.01} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`prices.${index}.currency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>واحد پول</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currencies.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      {c.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.pricingTier`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سطح قیمت‌گذاری</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="retail">خرده‌فروشی</SelectItem>
                                  <SelectItem value="wholesale">عمده‌فروشی</SelectItem>
                                  <SelectItem value="discount">تخفیف‌دار</SelectItem>
                                  <SelectItem value="premium">ویژه</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.effectiveDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاریخ ورود به انبار</FormLabel>
                              <FormControl>
                                <PersianDatePicker
                                  value={field.value ? new Date(field.value) : undefined}
                                  onChange={(d) => field.onChange(d ? d.toISOString().split("T")[0] : "")}
                                  placeholder="انتخاب تاریخ ورود"
                                />
                              </FormControl>
                              <FormDescription>تاریخ شمسی</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاریخ خروج / انقضا (اختیاری)</FormLabel>
                              <FormControl>
                                <PersianDatePicker
                                  value={field.value ? new Date(field.value) : undefined}
                                  onChange={(d) => field.onChange(d ? d.toISOString().split("T")[0] : "")}
                                  placeholder="انتخاب تاریخ خروج"
                                />
                              </FormControl>
                              <FormDescription>تاریخ شمسی</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`prices.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>یادداشت (اختیاری)</FormLabel>
                            <FormControl>
                              <Input placeholder="توضیحات اضافی درباره این سری..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {priceFields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>هنوز سری وارداتی ثبت نشده است</p>
                    <Button type="button" variant="outline" className="mt-4" onClick={handleAddPriceBatch}>
                      <Plus className="h-4 w-4 ml-1" />
                      افزودن سری اول
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Variants */}
          <TabsContent value="variants" className="space-y-5">
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base">متغیرهای محصول</CardTitle>
                <CardDescription>
                  متغیرهایی مانند رنگ، سایز، ظرفیت و... را تعریف کنید. هر متغیر می‌تواند چندین گزینه داشته باشد.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductVariantEditor 
                  variants={variants}
                  onChange={setVariants}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Attributes & Tags */}
          <TabsContent value="attributes" className="space-y-5">
            <Card className="shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base">تگ‌های محصول</CardTitle>
                <CardDescription>برچسب‌هایی برای جستجو و فیلتر سریع‌تر محصول</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTagSelect
                  value={selectedTags}
                  onChange={setSelectedTags}
                  maxTags={10}
                />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="py-4 flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">ویژگی‌های محصول</CardTitle>
                  <CardDescription>ویژگی‌های فنی به‌صورت کلید/مقدار</CardDescription>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAttribute}
                  className="h-8 shrink-0"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  افزودن ویژگی
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attributes.map((attribute, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="نام ویژگی (مثال: رنگ)"
                        value={attribute.key}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="مقدار (مثال: آبی)"
                        value={attribute.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttribute(index)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {attributes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p className="text-sm">هنوز ویژگی‌ای اضافه نشده است</p>
                      <p className="text-xs mt-1">می‌توانید ویژگی‌هایی مثل «جنس: چرم» یا «گارانتی: ۱۸ ماهه» اضافه کنید.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 -mx-6 px-6 py-3 mt-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            مرحله قبل
          </Button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            برای رفتن به مرحله بعد، فیلدهای ضروری این مرحله باید تکمیل شوند
          </div>

          {!isLastStep ? (
            <Button type="button" onClick={handleNext} className="gap-1 min-w-[140px]">
              مرحله بعد: {steps[currentStepIndex + 1].label}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="min-w-[160px] gap-1 ">
              <Check className="h-4 w-4" />
              {isEditMode ? "بروزرسانی محصول" : "ایجاد نهایی محصول"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
