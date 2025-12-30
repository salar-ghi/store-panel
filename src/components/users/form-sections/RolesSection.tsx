import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
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
  const handleRoleClick = (e: React.MouseEvent, roleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRoleToggle(roleId);
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
          <div className="mt-3 space-y-4">
            {roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <div 
                      key={role.id} 
                      role="button"
                      tabIndex={0}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                          : "hover:bg-muted/50 hover:border-muted-foreground/20"
                      }`}
                      onClick={(e) => handleRoleClick(e, role.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRoleToggle(role.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground/30"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div>
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
                                  +{role.permissions.length - 2} مورد دیگر
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })}
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
