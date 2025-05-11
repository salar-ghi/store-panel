
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { Button } from "@/components/ui/button";
import { PlusCircle, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { Category } from "@/types/category";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCategoryForm } from "@/components/categories/CreateCategoryForm";
import { EmptyCategories } from "@/components/categories/EmptyCategories";
import { CategoriesGrid } from "@/components/categories/CategoriesGrid";

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getAll,
  });

  const handleCreateCategory = async (data: any) => {
    try {
      // Convert parentId if it's "none"
      const categoryData = {
        ...data,
        parentId: data.parentId === "none" ? undefined : data.parentId
      };
      
      await CategoryService.create(categoryData);
      toast.success(`دسته‌بندی "${data.name}" با موفقیت ایجاد شد`);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("خطا در ایجاد دسته‌بندی");
      console.error(error);
    }
  };

  const handleEditCategory = async (data: any) => {
    try {
      if (editingCategory) {
        // Convert parentId if it's "none"
        const categoryData = {
          ...data,
          parentId: data.parentId === "none" ? undefined : data.parentId
        };
        
        await CategoryService.update(editingCategory.id, categoryData);
        toast.success(`دسته‌بندی "${data.name}" با موفقیت ویرایش شد`);
        setIsDialogOpen(false);
        setEditingCategory(null);
        refetch();
      }
    } catch (error) {
      toast.error("خطا در ویرایش دسته‌بندی");
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await CategoryService.delete(id);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      refetch();
    } catch (error) {
      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">دسته‌بندی‌ها</h2>
          <p className="text-muted-foreground">مدیریت دسته‌بندی‌های محصولات</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              افزودن دسته‌بندی
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}</DialogTitle>
            </DialogHeader>
            <CreateCategoryForm
              initialData={editingCategory || undefined}
              availableCategories={categories || []}
              onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingCategory(null);
              }}
            />
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
        <CategoriesGrid
          categories={categories}
          onEditCategory={openEditDialog}
          onDeleteCategory={handleDeleteCategory}
        />
      ) : (
        <EmptyCategories onClick={() => setIsDialogOpen(true)} />
      )}
    </div>
  );
}
