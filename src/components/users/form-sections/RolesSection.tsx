import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/user";
import { MultiSelectCheckbox, MultiSelectItem } from "@/components/ui/multi-select-checkbox";

interface RolesSectionProps {
  form: UseFormReturn<any>;
  roles: Role[];
}

export function RolesSection({ form, roles }: RolesSectionProps) {
  const items: MultiSelectItem[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    tags: role.permissions,
  }));

  return (
    <FormField
      control={form.control}
      name="roleIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            نقش‌ها
          </FormLabel>
          <FormDescription>یک یا چند نقش به این کاربر اختصاص دهید</FormDescription>

          <MultiSelectCheckbox
            items={items}
            selectedIds={Array.isArray(field.value) ? field.value : []}
            onSelectionChange={field.onChange}
            searchPlaceholder="جستجوی نقش..."
            emptyMessage="هیچ نقشی موجود نیست"
            emptySubMessage="ابتدا نقش‌ها را ایجاد کنید"
            noResultsMessage="نقشی با این عبارت یافت نشد"
            selectAllLabel="انتخاب همه"
            deselectAllLabel="لغو همه"
          />

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

