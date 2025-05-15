
import { Category } from "@/types/category";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { getImageFromStorage } from "@/lib/image-upload";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the image from storage if path exists
    if (category.image) {
      const storedImage = getImageFromStorage(category.image);
      if (storedImage) {
        setImageUrl(storedImage);
      } else {
        // If not in storage (direct URL from API), use it directly
        setImageUrl(category.image);
      }
    }
  }, [category.image]);

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={category.name}
              className="w-full h-full object-cover"
              onError={() => setImageUrl("/placeholder.svg")}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">{category.name[0]}</span>
            </div>
          )}
        </AspectRatio>
      </div>
      
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            {category.parentName && (
              <span className="text-sm text-muted-foreground">
                {category.parentName}
              </span>
            )}
          </div>
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
            {category.productCount} محصول
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onEdit(category)}
        >
          <Edit className="mr-2 h-4 w-4" />
          ویرایش
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(category.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
