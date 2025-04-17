
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ProductImageUpload } from "./ProductImageUpload";
import { SelectFields } from "./SelectFields";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateProductRequest } from "@/types/product";

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
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: CreateProductRequest) => void;
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [productImages, setProductImages] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: undefined,
      brandId: undefined,
      supplierId: undefined,
      images: [],
    },
  });

  const handleSubmit = (data: FormData) => {
    // Ensure all required fields are present before submitting
    const productData: CreateProductRequest = {
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: Number(data.categoryId),
      brandId: Number(data.brandId),
      supplierId: Number(data.supplierId),
      images: productImages,
    };
    
    onSubmit(productData);
    form.reset();
    setProductImages([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="flex justify-end">
          <Button type="submit" className="w-full">
            ایجاد محصول
          </Button>
        </div>
      </form>
    </Form>
  );
}
