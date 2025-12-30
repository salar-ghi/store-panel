import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (category.image) {
      setImageUrl(category.image);
    }
  }, [category.image]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-28 overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageUrl("/placeholder.svg")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-3xl font-bold text-primary/40">{category.name[0]}</span>
          </div>
        )}
        
        {/* Overlay with product count */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full shadow-sm">
            <Package className="h-3 w-3" />
            {category.productCount}
          </span>
        </div>

        {/* Action buttons overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-3 w-3 ml-1" />
            ویرایش
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{category.name}</h3>
            {category.parentName && (
              <span className="text-xs text-muted-foreground truncate block">
                {category.parentName}
              </span>
            )}
          </div>
        </div>
        
        {category.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1.5">
            {category.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
