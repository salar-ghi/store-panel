import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateBrandRequest, Brand } from "@/types/brand";
import { useEffect, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fileToBase64, validateImageFile, base64ToImageUrl } from "@/lib/image-upload";
import { toast } from "sonner";
import { CategoryService } from "@/services/category-service";
import { BrandService } from "@/services/brand-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const brandFormSchema = z.object({
  name: z.string().min(2, { message: "نام برند باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
  logo: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export interface BrandFormProps {
  editingBrand: Brand | null;
  onSuccess: () => void;
}

export function BrandForm({ editingBrand, onSuccess }: BrandFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: editingBrand?.name || "",
      description: editingBrand?.description || "",
      logo: editingBrand?.logo || "",
      categoryIds: editingBrand?.categoryIds || [],
    },
  });

  useEffect(() => {
    if (editingBrand) {
      form.reset({
        name: editingBrand.name,
        description: editingBrand.description,
        logo: editingBrand.logo || "",
        categoryIds: editingBrand.categoryIds || [],
      });
      if (editingBrand.logo) {
        setLogoPreview(base64ToImageUrl(editingBrand.logo));
      }
      setSelectedCategories(editingBrand.categoryIds || []);
    }
  }, [editingBrand, form]);

  const handleSubmit = async (data: BrandFormValues) => {
    try {
      setIsUploading(true);
      
      const brandRequest: CreateBrandRequest = {
        name: data.name,
        description: data.description,
        logo: data.logo,
        categoryIds: selectedCategories,
      };
      
      if (editingBrand) {
        await BrandService.update(editingBrand.id, brandRequest);
        toast.success("برند با موفقیت ویرایش شد");
      } else {
        await BrandService.create(brandRequest);
        toast.success("برند با موفقیت ایجاد شد");
      }
      
      onSuccess();
      form.reset();
      setLogoPreview(null);
      setSelectedCategories([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطا در ثبت اطلاعات");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateImageFile(file);
        const base64 = await fileToBase64(file);
        setLogoPreview(base64);
        form.setValue("logo", base64);
      } catch (error: any) {
        toast.error(error.message || "خطا در آپلود تصویر");
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    form.setValue("logo", "");
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || '';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              {/* <FormLabel className="self-start">لوگوی برند</FormLabel> */}
              <FormControl>
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-dashed border-border">
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt="Brand logo" className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="brand-logo"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("brand-logo")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {logoPreview ? "تغییر لوگو" : "انتخاب لوگو"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام برند</FormLabel>
              <FormControl>
                <Input placeholder="مثال: سامسونگ" {...field} />
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
                  placeholder="توضیحات برند را وارد کنید" 
                  {...field} 
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>دسته‌بندی‌ها</FormLabel>
          <div className="border rounded-lg p-3 bg-background">
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCategories.map(id => (
                  <Badge 
                    key={id} 
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => toggleCategory(id)}
                  >
                    {getCategoryName(id)}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
            <ScrollArea className="h-32" dir="rtl">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">دسته‌بندی‌ای موجود نیست</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </FormItem>
        
        <DialogFooter>          
          <Button type="submit" className="mx-2" disabled={isUploading}>
            {isUploading ? "در حال ذخیره..." : editingBrand ? "ویرایش برند" : "ایجاد برند"}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            انصراف
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
