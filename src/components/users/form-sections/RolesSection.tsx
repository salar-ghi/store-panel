import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/user";

interface RolesSectionProps {
  form: UseFormReturn<any>;
  roles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string) => void;
}

export function RolesSection({ form, roles, selectedRoles, onRoleToggle }: RolesSectionProps) {
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
          <FormDescription>
            یک یا چند نقش به این کاربر اختصاص دهید
          </FormDescription>
          <div className="mt-3 space-y-2">
            {roles.length > 0 ? (
              <div className="space-y-2">
                {roles.map((role) => {
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <div 
                      key={role.id} 
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => onRoleToggle(role.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onRoleToggle(role.id)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{role.name}</span>
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.permissions.slice(0, 2).map((permission, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground">هیچ نقشی موجود نیست</p>
                <p className="text-sm text-muted-foreground mt-1">ابتدا نقش‌ها را ایجاد کنید</p>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
