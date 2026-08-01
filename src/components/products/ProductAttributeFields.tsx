import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttributeService } from "@/services/attribute-service";
import { CategoryService } from "@/services/category-service";
import { ProductAttributeValue } from "@/types/attribute";
import { AttributeValueField } from "@/components/attributes/AttributeValueField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag } from "lucide-react";

interface Props {
  categoryId?: number;
  values: Record<number, ProductAttributeValue>;
  onChange: (values: Record<number, ProductAttributeValue>) => void;
  /** Names of attributes that are required but empty (highlighted). */
  invalidIds?: number[];
}

/**
 * Renders the dynamic attribute inputs defined for the selected category
 * (including the ones inherited from its parent categories).
 */
export function ProductAttributeFields({ categoryId, values, onChange, invalidIds = [] }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ["category-attributes", categoryId],
    queryFn: () => AttributeService.resolveCategoryAttributes(categoryId!, categories),
    enabled: !!categoryId && categories.length > 0,
  });

  const grouped = useMemo(() => {
    const own = attributes.filter((a) => !a.inheritedFrom);
    const inherited = attributes.filter((a) => a.inheritedFrom);
    return { own, inherited };
  }, [attributes]);

  if (!categoryId) {
    return (
      <Card className="shadow-none">
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            ویژگی‌های دسته‌بندی
          </CardTitle>
          <CardDescription>
            ابتدا در مرحله «اطلاعات پایه» دسته‌بندی محصول را انتخاب کنید تا ویژگی‌های آن نمایش داده شود.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          ویژگی‌های دسته‌بندی
        </CardTitle>
        <CardDescription>
          این ویژگی‌ها بر اساس دسته‌بندی انتخاب‌شده و دسته‌بندی‌های والد آن از سرور دریافت می‌شوند و
          برای فیلتر، جستجو و مقایسه محصولات استفاده می‌شوند.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : attributes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">برای این دسته‌بندی ویژگی‌ای تعریف نشده است</p>
            <p className="text-xs mt-1">
              از بخش دسته‌بندی‌ها می‌توانید برای این دسته ویژگی تعریف کنید.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...grouped.own, ...grouped.inherited].map((attr) => (
              <AttributeValueField
                key={attr.attributeDefinitionId}
                attribute={attr}
                value={values[attr.attributeDefinitionId]}
                invalid={invalidIds.includes(attr.attributeDefinitionId)}
                onChange={(v) =>
                  onChange({ ...values, [attr.attributeDefinitionId]: v })
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
