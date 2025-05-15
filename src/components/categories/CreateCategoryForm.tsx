
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateCategoryRequest, Category } from "@/types/category";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadImage } from "@/lib/image-upload";
import { toast } from "@/components/ui/use-toast";

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
  parentId: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  initialData?: Category;
  availableCategories: Category[];
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateCategoryForm({ initialData, availableCategories, onSubmit, onCancel }: CreateCategoryFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parentId: initialData?.parentId ? String(initialData.parentId) : undefined,
      imageUrl: initialData?.image || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        parentId: initialData.parentId ? String(initialData.parentId) : undefined,
        imageUrl: initialData.image || "",
      });
      
      // If there's an image URL, set it as preview
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [initialData, form]);

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      setIsUploading(true);
      
      // Upload image if one was selected
      let imageUrl = data.imageUrl;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, 'category');
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "خطا در آپلود تصویر",
            description: "لطفا دوباره تلاش کنید",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }
      
      const categoryRequest: CreateCategoryRequest = {
        name: data.name,
        description: data.description,
        parentId: data.parentId && data.parentId !== "none" ? parseInt(data.parentId) : undefined,
        image: imageUrl,
      };
      
      await onSubmit(categoryRequest);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a temporary preview for UI only
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Clean up the temporary object URL when we're done with it
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Filter out the current category when editing to avoid self-reference
  const parentCategoryOptions = availableCategories.filter(category => 
    !initialData || category.id !== initialData.id
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="self-start">تصویر دسته‌بندی</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 p-1">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt="Category image" />
                    ) : (
                      <AvatarFallback className="bg-gray-100">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    id="category-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("category-image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {imagePreview ? "تغییر تصویر" : "انتخاب تصویر"}
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
              <FormLabel>نام دسته‌بندی</FormLabel>
              <FormControl>
                <Input placeholder="مثال: الکترونیک" {...field} />
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
                  placeholder="توضیحات دسته‌بندی را وارد کنید" 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>دسته‌بندی والد</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دسته‌بندی والد (اختیاری)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">بدون دسته‌بندی والد</SelectItem>
                  {parentCategoryOptions.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>          
          <Button type="submit" className="mx-2" disabled={isUploading}>
            {isUploading ? "در حال آپلود..." : initialData ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            انصراف
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
