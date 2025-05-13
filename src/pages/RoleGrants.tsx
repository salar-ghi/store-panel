
import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RoleGrantsForm } from "@/components/users/RoleGrantsForm";

export default function RoleGrants() {
  const { data: roles, isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  const handleRoleAdded = () => {
    refetch();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت دسترسی‌های نقش‌ها</h1>
          <p className="text-muted-foreground">ایجاد و مدیریت دسترسی‌های نقش‌ها</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن نقش جدید
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md" dir="rtl">
            <SheetHeader>
              <SheetTitle className="text-center mt-2">ایجاد نقش جدید با دسترسی‌ها</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <RoleGrantsForm onRoleAdded={handleRoleAdded} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست نقش‌ها و دسترسی‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              خطا در بارگذاری نقش‌ها
            </div>
          ) : (
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
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions && role.permissions.length > 0 ? (
                            role.permissions.map((permission, index) => (
                              <Badge 
                                key={index} 
                                className={`
                                  ${permission === 'read' ? 'bg-blue-500' : ''}
                                  ${permission === 'write' ? 'bg-green-500' : ''}
                                  ${permission === 'update' ? 'bg-yellow-500' : ''}
                                  ${permission === 'delete' ? 'bg-red-500' : ''}
                                  ${permission === 'all' ? 'bg-purple-500' : ''}
                                `}
                              >
                                {permission === 'read' && 'خواندن'}
                                {permission === 'write' && 'نوشتن'}
                                {permission === 'update' && 'به‌روزرسانی'}
                                {permission === 'delete' && 'حذف'}
                                {permission === 'all' && 'همه دسترسی‌ها'}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">بدون دسترسی</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
