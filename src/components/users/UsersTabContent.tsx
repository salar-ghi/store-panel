
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UsersList } from "./UsersList";
import { RolesTable } from "./RolesTable";
import { RoleForm } from "./RoleForm";

interface UsersTabContentProps {
  onUserClick: (userId: string) => void;
}

export function UsersTabContent({ onUserClick }: UsersTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست کاربران</CardTitle>
      </CardHeader>
      <CardContent>
        <UsersList onUserClick={onUserClick} />
      </CardContent>
    </Card>
  );
}

export function RolesTabContent({ onRoleAdded }: { onRoleAdded: () => void }) {
  return (
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
            <RoleForm onRoleAdded={onRoleAdded} />
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        <RolesTable />
      </CardContent>
    </Card>
  );
}
