
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, X, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImageUpload } from "./ProductImageUpload";
import { SelectFields } from "./SelectFields";
import { ProductTagSelect } from "./ProductTagSelect";
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
import { CreateProductRequest, ProductAttribute, WeightUnit, QuantityUnit, DimensionUnit } from "@/types/product";
import { WarehouseService } from "@/services/warehouse-service";

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

const dimensionSchema = z.object({
  length: z.coerce.number().nonnegative({ message: "طول باید عدد مثبت باشد." }),
  width: z.coerce.number().nonnegative({ message: "عرض باید عدد مثبت باشد." }),
  height: z.coerce.number().nonnegative({ message: "ارتفاع باید عدد مثبت باشد." }),
  weight: z.coerce.number().nonnegative({ message: "وزن باید عدد مثبت باشد." }),
  dimensionUnit: z.enum(['cm', 'm', 'mm', 'inch', 'ft']),
  weightUnit: z.enum(['gram', 'kilogram', 'mithqal', 'ounce', 'pound']),
});

const stockSchema = z.object({
  quantity: z.coerce.number().int().nonnegative({ message: "تعداد باید عدد صحیح غیرمنفی باشد." }),
  reorderThreshold: z.coerce.number().int().nonnegative({ message: "حد سفارش مجدد باید عدد صحیح غیرمنفی باشد." }),
  warehouseId: z.coerce.number({ required_error: "لطفا انبار را انتخاب کنید." }),
  location: z.string().optional(),
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
  quantity: z.coerce.number().int().positive({ message: "تعداد وارده باید عدد مثبت باشد." }),
  soldQuantity: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

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
  dimensions: dimensionSchema.optional(),
  stock: stockSchema.optional(),
  prices: z.array(priceSchema).optional(),
  attributes: z.array(
    z.object({
      key: z.string().min(1, { message: "نام ویژگی نمی‌تواند خالی باشد." }),
      value: z.string().min(1, { message: "مقدار ویژگی نمی‌تواند خالی باشد." })
    })
  ).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: CreateProductRequest) => void;
  initialData?: Partial<CreateProductRequest>;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [productImages, setProductImages] = useState<string[]>(initialData?.images || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(initialData?.attributes || []);
  const [activeTab, setActiveTab] = useState("basic");

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: WarehouseService.getAll
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
      dimensions: initialData?.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        dimensionUnit: "cm",
        weightUnit: "gram"
      },
      stock: initialData?.stock || {
        quantity: 0,
        reorderThreshold: 0,
        warehouseId: 0,
        location: "",
        quantityUnit: "piece"
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
    },
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control: form.control,
    name: "prices"
  });

  const handleSubmit = (data: FormData) => {
    const productData: CreateProductRequest = {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId,
      supplierId: data.supplierId,
      images: productImages,
      tags: selectedTags,
      attributes: attributes,
      location: data.location,
      reorderLevel: data.reorderLevel,
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
        warehouseId: data.stock.warehouseId,
        location: data.stock.location || "",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" dir="rtl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="basic">اطلاعات اولیه</TabsTrigger>
            <TabsTrigger value="inventory">موجودی و انبار</TabsTrigger>
            <TabsTrigger value="dimensions">ابعاد و واحدها</TabsTrigger>
            <TabsTrigger value="attributes">ویژگی‌ها و تگ‌ها</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام محصول</FormLabel>
                      <FormControl>
                        <Input placeholder="نام محصول را وارد کنید" {...field} />
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
                          placeholder="توضیحات محصول را وارد کنید"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormItem className="col-span-2">
                  <FormLabel>تصاویر محصول</FormLabel>
                  <FormDescription>
                    تصاویر به صورت Base64 به سرور ارسال می‌شوند
                  </FormDescription>
                  <ProductImageUpload
                    value={productImages}
                    onChange={setProductImages}
                    maxImages={5}
                  />
                </FormItem>
              </div>
            </div>

            <SelectFields control={form.control} />
          </TabsContent>

          {/* Tab 2: Inventory */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات انبار و موجودی</CardTitle>
                <CardDescription>
                  واحد شمارش و اطلاعات انبارداری محصول را مشخص کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
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
                        <FormDescription>
                          مثال: عدد، جعبه، بسته، لیتر
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>موجودی اولیه</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock.reorderThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد سفارش مجدد</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" min={0} step={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock.warehouseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>انبار</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب انبار" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
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
                    name="stock.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>محل دقیق در انبار</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: قفسه A-15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Dimensions & Pricing */}
          <TabsContent value="dimensions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ابعاد و وزن محصول</CardTitle>
                <CardDescription>
                  واحد اندازه‌گیری ابعاد و وزن را مشخص کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
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

                <div className="grid grid-cols-4 gap-4">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    قیمت‌گذاری و سری‌های وارداتی
                  </CardTitle>
                  <CardDescription>
                    هر سری ورود کالا با قیمت و تعداد مختلف ثبت می‌شود و از موجودی و قیمت قبلی جدا است
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    موجودی کل: {getTotalStock()} 
                  </Badge>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPriceBatch}>
                    <Plus className="h-4 w-4 ml-1" />
                    افزودن سری جدید
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <div className="grid grid-cols-4 gap-4">
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

                      <div className="grid grid-cols-4 gap-4">
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
                              <FormLabel>تاریخ ورود</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`prices.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاریخ انقضا (اختیاری)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
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

          {/* Tab 4: Attributes & Tags */}
          <TabsContent value="attributes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تگ‌های محصول</CardTitle>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>تگ‌های محصول</FormLabel>
                  <ProductTagSelect
                    value={selectedTags}
                    onChange={setSelectedTags}
                    maxTags={10}
                  />
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ویژگی‌های محصول</CardTitle>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAttribute}
                  className="h-8"
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
                        className="h-8 w-8 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {attributes.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      هنوز هیچ ویژگی اضافه نشده است
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" className="min-w-[200px]">
            ایجاد محصول
          </Button>
        </div>
      </form>
    </Form>
  );
}
