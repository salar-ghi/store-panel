import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield } from "lucide-react";
import { UserForm } from "@/components/users/UserForm";
import { RoleForm } from "@/components/users/RoleForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UsersHeaderProps {
  onUserAdded: () => void;
  onRoleAdded: () => void;
}

export function UsersHeader({ onUserAdded, onRoleAdded }: UsersHeaderProps) {
  return (
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
              <SheetTitle className="text-center mt-2">ایجاد نقش جدید</SheetTitle>
            </SheetHeader>
            <RoleForm onRoleAdded={onRoleAdded} />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              افزودن کاربر
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md p-0" dir="rtl">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle className="text-center mt-2">ایجاد کاربر جدید</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)] px-6 pb-6">
              <UserForm onUserAdded={onUserAdded} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}