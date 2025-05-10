
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateCategoryRequest, Category } from "@/types/category";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
  parentId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  initialData?: Category;
  availableCategories: Category[];
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateCategoryForm({ initialData, availableCategories, onSubmit, onCancel }: CreateCategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parentId: initialData?.parentId ? String(initialData.parentId) : undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        parentId: initialData.parentId ? String(initialData.parentId) : undefined,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: CategoryFormValues) => {
    const categoryRequest: CreateCategoryRequest = {
      name: data.name,
      description: data.description,
      parentId: data.parentId ? parseInt(data.parentId) : undefined,
    };
    await onSubmit(categoryRequest);
    form.reset();
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
                  <SelectItem value="">بدون دسته‌بندی والد</SelectItem>
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
          <Button type="submit" className="mx-2">
            {initialData ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"}
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
