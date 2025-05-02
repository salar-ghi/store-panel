
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
import { PlusCircle, Loader2, UserPlus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserForm } from "@/components/users/UserForm";
import { RoleForm } from "@/components/users/RoleForm";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Users() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
  });

  const handleUserAdded = () => {
    refetch();
  };

  const handleRoleAdded = () => {
    refetch();
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
          <p className="text-muted-foreground">ایجاد و مدیریت کاربران و نقش‌های آنها</p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Shield className="ml-2 h-4 w-4" />
                افزودن نقش
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>ایجاد نقش جدید</SheetTitle>
              </SheetHeader>
              <RoleForm onRoleAdded={handleRoleAdded} />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <UserPlus className="ml-2 h-4 w-4" />
                افزودن کاربر
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>ایجاد کاربر جدید</SheetTitle>
              </SheetHeader>
              <UserForm onUserAdded={handleUserAdded} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">لیست کاربران</TabsTrigger>
          <TabsTrigger value="roles">مدیریت نقش‌ها</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>لیست کاربران</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-destructive text-center py-8">
                  خطا در بارگذاری کاربران
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام کاربری</TableHead>
                      <TableHead>ایمیل</TableHead>
                      <TableHead>شماره تلفن</TableHead>
                      <TableHead>نقش‌ها</TableHead>
                      <TableHead className="text-center">مدیر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <TableRow 
                          key={user.id} 
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email || "ندارد"}</TableCell>
                          <TableCell>{user.phoneNumber}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role, index) => (
                                  <Badge key={index} variant="outline" className="ml-1">
                                    {role}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">بدون نقش</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {user.isAdmin && (
                              <Badge variant="default" className="bg-purple-500">مدیر</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          کاربری یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>مدیریت نقش‌ها</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    نقش جدید
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>ایجاد نقش جدید</SheetTitle>
                  </SheetHeader>
                  <RoleForm onRoleAdded={handleRoleAdded} />
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <RolesTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUserId && (
        <UserDetailsDialog 
          userId={selectedUserId} 
          open={!!selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
    </div>
  );
}

function RolesTable() {
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
