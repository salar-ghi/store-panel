
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { Menu, Search, User, LogOut, Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function Navbar() {
  const { toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(3);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
        <Menu className="h-5 w-5" />
        <span className="sr-only">باز/بستن منو</span>
      </Button>
      <div className="flex-1">
        <div className="relative md:w-64 lg:w-80">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجو..."
            className="w-full bg-background pr-8 md:w-64 lg:w-80 text-right"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-right">اعلان‌های جدید</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto text-right">
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">موجودی پایین محصول</p>
                <span className="text-sm text-muted-foreground">محصول "گوشی سامسونگ A52" به حد پایین موجودی رسید.</span>
                <span className="text-xs text-muted-foreground mt-1">20 دقیقه پیش</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">سفارش جدید</p>
                <span className="text-sm text-muted-foreground">یک سفارش جدید از کاربر "علی محمدی" ثبت شد.</span>
                <span className="text-xs text-muted-foreground mt-1">1 ساعت پیش</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">محصول جدید</p>
                <span className="text-sm text-muted-foreground">محصول جدید "هندزفری بلوتوث" به انبار اضافه شد.</span>
                <span className="text-xs text-muted-foreground mt-1">2 ساعت پیش</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')}>
              <span className="mx-auto">مشاهده همه اعلان‌ها</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">منوی کاربر</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user ? user.username : 'حساب کاربری من'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-right">
              پروفایل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-right">
              تنظیمات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-right">
              <LogOut className="ml-2 h-4 w-4" />
              خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
