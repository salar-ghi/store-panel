
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RolesTable() {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">
        خطا در بارگذاری نقش‌ها
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>نام نقش</TableHead>
          <TableHead>دسترسی‌ها</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles && roles.length > 0 ? (
          roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="ml-1">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">بدون دسترسی خاص</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
              نقشی یافت نشد
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
