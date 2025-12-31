import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, CheckSquare, Square } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/user";
import { useState, useMemo } from "react";

interface RolesSectionProps {
  form: UseFormReturn<any>;
  roles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string) => void;
  onSelectAll?: (roleIds: string[]) => void;
}

export function RolesSection({ form, roles, selectedRoles, onRoleToggle, onSelectAll }: RolesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.permissions?.some(p => p.toLowerCase().includes(query))
    );
  }, [roles, searchQuery]);

  const allFilteredSelected = filteredRoles.length > 0 && 
    filteredRoles.every(role => selectedRoles.includes(role.id));

  const handleSelectAll = () => {
    if (!onSelectAll) {
      // Fallback: toggle each filtered role
      const filteredIds = filteredRoles.map(r => r.id);
      if (allFilteredSelected) {
        // Deselect all filtered
        filteredIds.forEach(id => {
          if (selectedRoles.includes(id)) onRoleToggle(id);
        });
      } else {
        // Select all filtered that aren't already selected
        filteredIds.forEach(id => {
          if (!selectedRoles.includes(id)) onRoleToggle(id);
        });
      }
    } else {
      const filteredIds = filteredRoles.map(r => r.id);
      if (allFilteredSelected) {
        // Deselect all filtered
        onSelectAll(selectedRoles.filter(id => !filteredIds.includes(id)));
      } else {
        // Select all filtered
        const newSelection = [...new Set([...selectedRoles, ...filteredIds])];
        onSelectAll(newSelection);
      }
    }
  };

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
          
          {roles.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی نقش..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="shrink-0 gap-1.5"
              >
                {allFilteredSelected ? (
                  <>
                    <Square className="h-4 w-4" />
                    لغو همه
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    انتخاب همه
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {roles.length > 0 ? (
              filteredRoles.length > 0 ? (
                <div className="space-y-2">
                  {filteredRoles.map((role) => {
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
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-muted-foreground text-sm">نقشی با این عبارت یافت نشد</p>
                </div>
              )
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
