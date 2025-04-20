import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { Button } from "@/components/ui/button";
import { PlusCircle, Grid3X3 } from "lucide-react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { toast } from "sonner";
import { Category, CreateCategoryRequest } from "@/types/category";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getAll,
  });

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const categoryRequest: CreateCategoryRequest = {
        name: data.name,
        description: data.description
      };
      
      await CategoryService.create(categoryRequest);
      toast.success(`دسته‌بندی "${data.name}" با موفقیت ایجاد شد`);
      setIsDialogOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      toast.error("خطا در ایجاد دسته‌بندی");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">دسته‌بندی‌ها</h2>
          <p className="text-muted-foreground">مدیریت دسته‌بندی‌های محصولات</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              افزودن دسته‌بندی
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ایجاد دسته‌بندی جدید</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    onClick={() => {
                      form.reset();
                      setIsDialogOpen(false);
                    }}
                  >
                    انصراف
                  </Button>
                  <Button type="submit">ایجاد دسته‌بندی</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin">
            <Grid3X3 className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-20">
          <p>خطا در بارگذاری دسته‌بندی‌ها</p>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="mt-4"
          >
            تلاش مجدد
          </Button>
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={(category) => {
                setSelectedCategory(category);
                setIsDialogOpen(true);
              }}
              onDelete={async (id) => {
                try {
                  await CategoryService.delete(id);
                  toast.success("دسته‌بندی با موفقیت حذف شد");
                  refetch();
                } catch (error) {
                  toast.error("خطا در حذف دسته‌بندی");
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-lg bg-muted/10">
          <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-medium mt-4">دسته‌بندی‌ای یافت نشد</h3>
          <p className="text-muted-foreground mt-2">برای شروع، اولین دسته‌بندی خود را ایجاد کنید</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن دسته‌بندی
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ایجاد دسته‌بندی جدید</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onClick={() => {
                        form.reset();
                        setIsDialogOpen(false);
                      }}
                    >
                      انصراف
                    </Button>
                    <Button type="submit">ایجاد دسته‌بندی</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
