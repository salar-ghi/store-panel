
import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, Users } from "lucide-react";
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
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center">
            <Users className="h-4 w-4 ml-1 text-muted-foreground" />
            نقش‌ها
          </FormLabel>
          <FormDescription>
            یک یا چند نقش به این کاربر اختصاص دهید
          </FormDescription>
          <div className="mt-3 space-y-4">
            {roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <div 
                    key={role.id} 
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedRoles.includes(role.id) 
                        ? "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                    onClick={() => onRoleToggle(role.id)}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        className="data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                      />
                      <div className="mr-2">
                        <label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">{role.name}</label>
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.permissions.slice(0, 2).map((permission, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 2} مورد دیگر
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedRoles.includes(role.id) && (
                      <Check className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground">هیچ نقشی موجود نیست</p>
                <p className="text-sm text-muted-foreground mt-1">ابتدا نقش‌ها را ایجاد کنید تا بتوانید به کاربران اختصاص دهید</p>
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
