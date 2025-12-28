
import { useQuery } from "@tanstack/react-query";
import { Control, useWatch } from "react-hook-form";
import { useMemo } from "react";
import {
  FormControl,
  FormField,
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
import { CategoryService } from "@/services/category-service";
import { BrandService } from "@/services/brand-service";
import { SupplierService } from "@/services/supplier-service";

interface SelectFieldsProps {
  control: Control<any>;
}

export function SelectFields({ control }: SelectFieldsProps) {
  // Watch the categoryId field to filter brands
  const selectedCategoryId = useWatch({
    control,
    name: "categoryId",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const { data: allBrands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandService.getAll,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAll,
  });

  // Filter brands based on selected category
  const filteredBrands = useMemo(() => {
    if (!selectedCategoryId) {
      return allBrands;
    }
    
    return allBrands.filter(brand => {
      // If brand has no categoryIds, show it for all categories
      if (!brand.categoryIds || brand.categoryIds.length === 0) {
        return true;
      }
      // Check if brand belongs to the selected category
      return brand.categoryIds.includes(Number(selectedCategoryId));
    });
  }, [allBrands, selectedCategoryId]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دسته‌بندی</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <SelectItem value="no-category" disabled>
                    دسته‌بندی‌ای موجود نیست
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="brandId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>برند</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب برند" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredBrands.map((brand) => (
                  <SelectItem
                    key={brand.id}
                    value={brand.id.toString()}
                  >
                    {brand.name}
                  </SelectItem>
                ))}
                {filteredBrands.length === 0 && (
                  <SelectItem value="no-brand" disabled>
                    {selectedCategoryId ? "برندی برای این دسته‌بندی موجود نیست" : "برندی موجود نیست"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="supplierId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تامین‌کننده</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب تامین‌کننده" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem
                    key={supplier.id}
                    value={supplier.id.toString()}
                  >
                    {supplier.name}
                    {supplier.isApproved ? '' : ' (در انتظار تایید)'}
                  </SelectItem>
                ))}
                {suppliers.length === 0 && (
                  <SelectItem value="no-supplier" disabled>
                    تامین‌کننده‌ای موجود نیست
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
