
import { useQuery } from "@tanstack/react-query";
import { Control } from "react-hook-form";
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
import { WarehouseService } from "@/services/warehouse-service";

interface SelectFieldsProps {
  control: Control<any>;
}

export function SelectFields({ control }: SelectFieldsProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAll,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandService.getAll,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAll,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: WarehouseService.getAll,
  });

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
                {brands.map((brand) => (
                  <SelectItem
                    key={brand.id}
                    value={brand.id.toString()}
                  >
                    {brand.name}
                  </SelectItem>
                ))}
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
                  <SelectItem value="" disabled>
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
