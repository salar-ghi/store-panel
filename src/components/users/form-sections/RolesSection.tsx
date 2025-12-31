import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/user";
import { MultiSelectCheckbox, MultiSelectItem } from "@/components/ui/multi-select-checkbox";

interface RolesSectionProps {
  form: UseFormReturn<any>;
  roles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string) => void;
  onSelectAll?: (roleIds: string[]) => void;
}

export function RolesSection({ form, roles, selectedRoles, onSelectAll }: RolesSectionProps) {
  const items: MultiSelectItem[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    tags: role.permissions,
  }));

  const handleSelectionChange = (ids: string[]) => {
    if (onSelectAll) {
      onSelectAll(ids);
    }
    form.setValue("roleIds", ids);
  };

  return (
    <FormField
      control={form.control}
      name="roleIds"
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            نقش‌ها
          </FormLabel>
          <FormDescription>
            یک یا چند نقش به این کاربر اختصاص دهید
          </FormDescription>
          
          <MultiSelectCheckbox
            items={items}
            selectedIds={selectedRoles}
            onSelectionChange={handleSelectionChange}
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
