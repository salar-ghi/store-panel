import { useEffect, useMemo } from "react";
import { Control, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { CategoryService } from "@/services/category-service";
import { ProductAttribute } from "@/types/product";

// Keywords (persian + english) for categories that require a gender attribute.
// Add more here to extend to other gendered categories (e.g. clothing).
const GENDER_KEYWORDS = [
  "عطر",
  "ادکلن",
  "پرفیوم",
  "perfume",
  "fragrance",
  "cologne",
  "آرایشی",
  "بهداشتی",
  "cosmetic",
  "پوشاک",
  "لباس",
  "clothing",
  "apparel",
];

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "male", label: "مردانه" },
  { value: "female", label: "زنانه" },
  { value: "unisex", label: "یونیسکس" },
];

interface GenderFieldProps {
  control: Control<any>;
  attributes: ProductAttribute[];
  setAttributes: (attrs: ProductAttribute[]) => void;
}

/**
 * Conditionally renders a "Gender" selector when the currently selected
 * category is gender-sensitive (perfume, cosmetics, clothing, ...).
 * The value is persisted as an attribute with key "gender" — no backend
 * schema change is required.
 */
export function GenderField({ control, attributes, setAttributes }: GenderFieldProps) {
  const categoryId = useWatch({ control, name: "categoryId" });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const selectedCategoryName = useMemo(() => {
    if (!categoryId) return "";
    const cat = categories.find((c: any) => Number(c.id) === Number(categoryId));
    // include parent name too so subcategories inherit the requirement
    const parent = cat?.parentId
      ? categories.find((c: any) => Number(c.id) === Number(cat.parentId))
      : undefined;
    return `${cat?.name ?? ""} ${parent?.name ?? ""}`.toLowerCase();
  }, [categoryId, categories]);

  const needsGender = useMemo(() => {
    if (!selectedCategoryName) return false;
    return GENDER_KEYWORDS.some((k) => selectedCategoryName.includes(k.toLowerCase()));
  }, [selectedCategoryName]);

  const current = attributes.find((a) => a.key === "gender")?.value ?? "";

  // If the category no longer needs a gender attribute, clean it up.
  useEffect(() => {
    if (!needsGender && current) {
      setAttributes(attributes.filter((a) => a.key !== "gender"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsGender]);

  if (!needsGender) return null;

  const handleChange = (value: string) => {
    const others = attributes.filter((a) => a.key !== "gender");
    setAttributes([...others, { key: "gender", value }]);
  };

  return (
    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <FormItem>
        <FormLabel className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          جنسیت محصول
          <span className="text-destructive">*</span>
        </FormLabel>
        <Select value={current} onValueChange={handleChange}>
          <FormControl>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="انتخاب کنید (مردانه / زنانه / یونیسکس)" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {GENDER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormDescription>
          این دسته‌بندی نیاز به مشخص شدن جنسیت مصرف‌کننده دارد. مقدار به‌عنوان ویژگی
          <span className="font-mono mx-1">gender</span> ذخیره می‌شود.
        </FormDescription>
        {!current && (
          <FormMessage>لطفاً جنسیت محصول را انتخاب کنید.</FormMessage>
        )}
      </FormItem>
    </div>
  );
}
