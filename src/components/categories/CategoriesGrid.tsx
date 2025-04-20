
import { Category } from "@/types/category";
import { CategoryCard } from "./CategoryCard";

interface CategoriesGridProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => Promise<void>;
}

export function CategoriesGrid({ categories, onEditCategory, onDeleteCategory }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
        />
      ))}
    </div>
  );
}
