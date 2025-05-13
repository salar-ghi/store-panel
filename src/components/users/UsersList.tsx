
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
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsersListProps {
  onUserClick: (userId: string) => void;
}

export function UsersList({ onUserClick }: UsersListProps) {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
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
        خطا در بارگذاری کاربران
      </div>
    );
  }

  return (
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead>نام کاربری</TableHead>
          <TableHead>ایمیل</TableHead>
          <TableHead>شماره تلفن</TableHead>
          <TableHead>نقش‌ها</TableHead>
          <TableHead className="">مدیر</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users && users.length > 0 ? (
          users.map((user) => (
            <TableRow 
              key={user.id} 
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => onUserClick(user.id)}
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
  );
}
