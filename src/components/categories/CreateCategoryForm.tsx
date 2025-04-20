
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateCategoryRequest } from "@/types/category";

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateCategoryForm({ onSubmit, onCancel }: CreateCategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    const categoryRequest: CreateCategoryRequest = {
      name: data.name,
      description: data.description
    };
    await onSubmit(categoryRequest);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            انصراف
          </Button>
          <Button type="submit">ایجاد دسته‌بندی</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
