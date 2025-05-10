
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProductRequest, ProductAttribute, ProductDimension, ProductStock, ProductPrice } from "@/types/product";
import { WarehouseService } from "@/services/warehouse-service";

const dimensionSchema = z.object({
  length: z.coerce.number().positive({
    message: "Length must be a positive number.",
  }),
  width: z.coerce.number().positive({
    message: "Width must be a positive number.",
  }),
  height: z.coerce.number().positive({
    message: "Height must be a positive number.",
  }),
  weight: z.coerce.number().positive({
    message: "Weight must be a positive number.",
  }),
  unit: z.string().min(1, { 
    message: "Please select a unit." 
  }),
});

const stockSchema = z.object({
  quantity: z.coerce.number().int().nonnegative({
    message: "Quantity must be a non-negative integer.",
  }),
  reorderThreshold: z.coerce.number().int().nonnegative({
    message: "Reorder threshold must be a non-negative integer.",
  }),
  warehouseId: z.coerce.number({
    required_error: "Please select a warehouse.",
  }),
  location: z.string().optional(),
});

const priceSchema = z.object({
  amount: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  currency: z.string().min(1, {
    message: "Please select a currency.",
  }),
  pricingTier: z.enum(['retail', 'wholesale', 'discount', 'premium'], {
    required_error: "Please select a pricing tier.",
  }),
  effectiveDate: z.string().min(1, {
    message: "Please select an effective date.",
  }),
  expiryDate: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  stockQuantity: z.coerce.number().int().nonnegative({
    message: "Stock quantity must be a non-negative integer.",
  }),
  categoryId: z.coerce.number({
    required_error: "Please select a category.",
  }),
  brandId: z.coerce.number({
    required_error: "Please select a brand.",
  }),
  supplierId: z.coerce.number({
    required_error: "Please select a supplier.",
  }),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  location: z.string().optional(),
  dimensions: dimensionSchema.optional(),
  stock: stockSchema.optional(),
  prices: z.array(priceSchema).optional(),
  attributes: z.array(
    z.object({
      key: z.string().min(1, { message: "Key cannot be empty." }),
      value: z.string().min(1, { message: "Value cannot be empty." })
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
      price: initialData?.price || 0,
      stockQuantity: initialData?.stockQuantity || 0,
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
        unit: "cm"
      },
      stock: initialData?.stock || {
        quantity: 0,
        reorderThreshold: 0,
        warehouseId: 0,
        location: ""
      },
      prices: initialData?.prices || [{
        amount: 0,
        currency: "USD",
        pricingTier: "retail",
        effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: ""
      }],
      attributes: initialData?.attributes || [],
    },
  });

  const handleSubmit = (data: FormData) => {
    // Ensure all required properties are present by explicitly adding them
    const productData: CreateProductRequest = {
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: data.categoryId,
      brandId: data.brandId,
      supplierId: data.supplierId,
      images: productImages,
      tags: selectedTags,
      attributes: attributes,
      location: data.location,
      reorderLevel: data.reorderLevel,
      dimensions: data.dimensions ? {
        length: data.dimensions.length || 0,
        width: data.dimensions.width || 0,
        height: data.dimensions.height || 0,
        weight: data.dimensions.weight || 0,
        unit: data.dimensions.unit || "cm"
      } : undefined,
      stock: data.stock ? {
        quantity: data.stock.quantity || 0,
        reorderThreshold: data.stock.reorderThreshold || 0,
        warehouseId: data.stock.warehouseId || 0,
        location: data.stock.location || ""
      } : undefined,
      prices: data.prices ? data.prices.map(price => ({
        amount: price.amount || 0,
        currency: price.currency || "USD",
        pricingTier: price.pricingTier || "retail",
        effectiveDate: price.effectiveDate || new Date().toISOString().split('T')[0],
        expiryDate: price.expiryDate
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" dir="rtl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="basic">اطلاعات اولیه</TabsTrigger>
            <TabsTrigger value="inventory">موجودی و انبار</TabsTrigger>
            <TabsTrigger value="dimensions">ابعاد و قیمت</TabsTrigger>
            <TabsTrigger value="attributes">ویژگی‌ها و تگ‌ها</TabsTrigger>
          </TabsList>

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قیمت</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>موجودی</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={1}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <FormItem className="col-span-2">
                  <FormLabel>تصاویر محصول</FormLabel>
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

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات انبار و موجودی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تعداد موجودی</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={1}
                            {...field}
                          />
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
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={1}
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
                              <SelectItem
                                key={warehouse.id}
                                value={warehouse.id.toString()}
                              >
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
                          <Input
                            placeholder="مثال: قفسه A-15"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dimensions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ابعاد محصول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>طول</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
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
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
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
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
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
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="dimensions.unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب واحد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cm">سانتی‌متر (cm)</SelectItem>
                            <SelectItem value="m">متر (m)</SelectItem>
                            <SelectItem value="in">اینچ (in)</SelectItem>
                            <SelectItem value="ft">فوت (ft)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اطلاعات قیمت‌گذاری</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prices.0.amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مبلغ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prices.0.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>واحد پول</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب واحد پول" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">دلار آمریکا (USD)</SelectItem>
                            <SelectItem value="EUR">یورو (EUR)</SelectItem>
                            <SelectItem value="IRR">ریال (IRR)</SelectItem>
                            <SelectItem value="GBP">پوند (GBP)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prices.0.pricingTier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سطح قیمت‌گذاری</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب سطح قیمت‌گذاری" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="retail">خرده‌فروشی (Retail)</SelectItem>
                            <SelectItem value="wholesale">عمده‌فروشی (Wholesale)</SelectItem>
                            <SelectItem value="discount">تخفیف‌دار (Discount)</SelectItem>
                            <SelectItem value="premium">ویژه (Premium)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prices.0.effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاریخ شروع اعتبار</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="prices.0.expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاریخ پایان اعتبار (اختیاری)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

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
                        placeholder="نام ویژگی"
                        value={attribute.key}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="مقدار"
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
