
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Percent, 
  Settings, 
  Box,
  Tag,
  FolderTree,
  LayoutDashboard,
  Image,
  PictureInPicture
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  icon: React.ElementType;
  title: string;
  path: string;
  isActive?: boolean;
}

const sidebarItems = [
  { title: "داشبورد", path: "/", icon: LayoutDashboard },
  { title: "محصولات", path: "/products", icon: Package },
  { title: "دسته‌بندی‌ها", path: "/categories", icon: FolderTree },
  { title: "برندها", path: "/brands", icon: Tag },
  { title: "سفارشات", path: "/orders", icon: ShoppingBag },
  { title: "کاربران", path: "/users", icon: Users },
  { title: "بنرها", path: "/banners", icon: Image },
  { title: "تگ‌ها", path: "/tags", icon: PictureInPicture },
  { title: "تحلیل‌ها", path: "/analytics", icon: BarChart3 },
  { title: "تخفیف‌ها", path: "/promotions", icon: Percent },
  { title: "تنظیمات", path: "/settings", icon: Settings },
];

function SidebarItem({ icon: Icon, title, path, isActive }: SidebarItemProps) {
  const { collapsed } = useSidebarStore();

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        collapsed ? "flex-col justify-center" : "flex-row-reverse" 
      )}
    >
      <Icon className={cn("h-5 w-5", collapsed && "h-6 w-6")} />
      {!collapsed && <span>{title}</span>}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const { collapsed } = useSidebarStore();
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col border-l bg-sidebar h-screen transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="p-4 h-14 flex items-center border-b">
        {!collapsed && (
          <h1 className="font-semibold text-lg">مدیریت فروشگاه</h1>
        )}
        {collapsed && (
          <Box className="h-6 w-6 mx-auto" />
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hidden">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            path={item.path}
            isActive={location.pathname === item.path}
          />
        ))}
      </nav>
    </div>
  );
}
