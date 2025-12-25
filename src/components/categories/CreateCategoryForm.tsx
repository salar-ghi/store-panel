
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryService } from "@/services/category-service";
import { Category, CreateCategoryRequest } from "@/types/category";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "نام دسته‌بندی باید حداقل 2 کاراکتر باشد.",
  }),
  description: z.string().min(10, {
    message: "توضیحات باید حداقل 10 کاراکتر باشد.",
  }),
  parentId: z.number().optional(),
  image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  editingCategory?: Category | null;
}

export function CreateCategoryForm({ onSuccess, editingCategory }: CreateCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingCategory?.name || "",
      description: editingCategory?.description || "",
      parentId: editingCategory?.parentId || undefined,
      image: editingCategory?.image || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: CategoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی با موفقیت ایجاد شد");
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد دسته‌بندی");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryRequest }) =>
      CategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در به‌روزرسانی دسته‌بندی");
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const categoryData: CreateCategoryRequest = {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        image: data.image,
      };

      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data: categoryData });
      } else {
        await createMutation.mutateAsync(categoryData);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    form.setValue("image", imageUrl);
  };

  // Filter out current category from parent options to prevent circular reference
  const parentOptions = categories.filter(cat => cat.id !== editingCategory?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام دسته‌بندی</FormLabel>
              <FormControl>
                <Input placeholder="نام دسته‌بندی را وارد کنید" {...field} />
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
                  className="min-h-[100px]"
                  {...field} 
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
              <FormLabel>دسته‌بندی والد (اختیاری)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="دسته‌بندی والد را انتخاب کنید" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">هیچ والدی انتخاب نشده</SelectItem>
                  {parentOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <ImageUpload
                onImageUpload={handleImageUpload}
                entityType="category"
                currentImage={field.value}
                label="تصویر دسته‌بندی"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting 
            ? (editingCategory ? "در حال به‌روزرسانی..." : "در حال ایجاد...") 
            : (editingCategory ? "به‌روزرسانی دسته‌بندی" : "ایجاد دسته‌بندی")
          }
        </Button>
      </form>
    </Form>
  );
}
