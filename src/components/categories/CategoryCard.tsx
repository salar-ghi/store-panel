
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Folder, Edit, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => Promise<void>;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const formattedDate = new Date(category.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center gap-3">
        <Avatar className="h-12 w-12">
          {category.image ? (
            <AvatarImage src={category.image} alt={category.name} />
          ) : (
            <AvatarFallback className="bg-primary/10">
              <Folder className="h-6 w-6 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
          {category.parentName && (
            <p className="text-sm text-muted-foreground">
              زیرمجموعه: {category.parentName}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm mb-1">{category.description}</p>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">تاریخ ایجاد:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">محصولات:</span>
            <span className="font-medium">{category.productCount || 0}</span>
          </div>
        </div>
        
        {category.brandRelations && category.brandRelations.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">برندها:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {category.brandRelations.slice(0, 3).map((brand, idx) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-300 dark:ring-blue-700/30">
                        {brand}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{brand}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {category.brandRelations.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-500/30">
                  +{category.brandRelations.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(category)}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          ویرایش
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex items-center gap-1"
          onClick={() => onDelete(category.id)}
        >
          <Trash className="h-4 w-4" />
          حذف
        </Button>
      </CardFooter>
    </Card>
  );
}
