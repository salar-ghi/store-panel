
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { 
  BarChart3, 
  Box, 
  Home, 
  Package, 
  Percent, 
  Settings, 
  ShoppingBag, 
  Users
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
  { title: "Dashboard", path: "/", icon: Home },
  { title: "Products", path: "/products", icon: Package },
  { title: "Orders", path: "/orders", icon: ShoppingBag },
  { title: "Customers", path: "/customers", icon: Users },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Promotions", path: "/promotions", icon: Percent },
  { title: "Settings", path: "/settings", icon: Settings },
];

function SidebarItem({ icon: Icon, title, path, isActive }: SidebarItemProps) {
  const { collapsed } = useSidebarStore();

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        collapsed && "flex-col justify-center"
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
        "flex flex-col border-r bg-sidebar h-screen transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="p-4 h-14 flex items-center border-b">
        {!collapsed && (
          <h1 className="font-semibold text-lg">ShopAdmin</h1>
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
