
import React from 'react';
import { Category } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Package, Tag } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="h-full transition-all hover:border-primary/20 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{category.name}</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              className="h-8 w-8 text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>{category.productCount || 0}</strong> products
          </span>
        </div>
        
        {category.brandRelations && category.brandRelations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Related brands:</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {category.brandRelations.map((brand, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
          Created: {new Date(category.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
