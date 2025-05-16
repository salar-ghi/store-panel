
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { 
  LayoutDashboard,
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Percent, 
  Settings, 
  Box,
  Tag,
  FolderTree,
  Image,
  PictureInPicture,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Package as PackageIcon,
  PackageX,
  Boxes,
  Bell,
  MessageSquare,
  Inbox,
  Truck
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  icon: React.ElementType;
  title: string;
  path: string;
  isActive?: boolean;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

const sidebarItems = [
  { title: "داشبورد", path: "/", icon: LayoutDashboard },
  { title: "بنرها", path: "/banners", icon: Image },
  { title: "دسته‌بندی‌ها", path: "/categories", icon: FolderTree },
  { title: "برندها", path: "/brands", icon: Tag },
  { title: "محصولات", path: "/products", icon: Package },
  { title: "تامین‌کنندگان", path: "/suppliers", icon: Truck },
  { 
    title: "انبارداری", 
    path: "/inventory", 
    icon: Boxes,
    subItems: [
      { title: "موجودی", path: "/inventory", icon: Box },
      { title: "مکان‌های انبار", path: "/inventory/locations", icon: PackageIcon },
      { title: "ثبت ورودی", path: "/inventory/inputs", icon: Inbox },
    ]
  },
  { 
    title: "سفارشات", 
    path: "/orders", 
    icon: ShoppingBag,
    subItems: [
      { title: "سفارشات جدید", path: "/orders", icon: ShoppingCart },
      { title: "سفارشات مرجوعی", path: "/orders/returned", icon: PackageX },
    ]
  },
  
  { 
    title: "اعلان‌ها و پیام‌ها", 
    path: "/notifications", 
    icon: Bell,
    subItems: [
      { title: "اعلان‌ها", path: "/notifications", icon: Bell },
      { title: "پیام‌ها", path: "/messages", icon: MessageSquare },
      { title: "تنظیمات اعلان‌ها", path: "/notification-settings", icon: Settings },
    ]
  },
  { title: "تگ‌ها", path: "/tags", icon: PictureInPicture },
  { title: "تخفیف‌ها", path: "/promotions", icon: Percent },
  { title: "کاربران", path: "/users", icon: Users },
  { title: "تحلیل‌ها", path: "/analytics", icon: BarChart3 },
  { title: "تنظیمات", path: "/settings", icon: Settings },
];

function SidebarItem({ 
  icon: Icon, 
  title, 
  path, 
  isActive,
  hasSubItems,
  isExpanded,
  onClick
}: SidebarItemProps) {
  const { collapsed } = useSidebarStore();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        collapsed ? "justify-center" : "flex-row justify-between" 
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", collapsed && "h-6 w-6")} />
        {!collapsed && <span>{title}</span>}
      </div>
      {!collapsed && hasSubItems && (
        <div className="mr-auto">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      )}
    </button>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const { collapsed } = useSidebarStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["سفارشات", "انبارداری", "اعلان‌ها و پیام‌ها"]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

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
          <h1 className="font-semibold text-lg">مدیریت فروشگاه</h1>
        )}
        {collapsed && (
          <Box className="h-6 w-6 mx-auto" />
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hidden">
        {sidebarItems.map((item) => {
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.title} className="flex flex-col">
              {hasSubItems ? (
                <SidebarItem
                  title={item.title}
                  icon={item.icon}
                  path={item.path}
                  isActive={location.pathname === item.path && !location.pathname.includes('/returned')}
                  hasSubItems={hasSubItems}
                  isExpanded={isExpanded}
                  onClick={() => toggleExpanded(item.title)}
                />
              ) : (
                <Link to={item.path}>
                  <SidebarItem
                    title={item.title}
                    icon={item.icon}
                    path={item.path}
                    isActive={location.pathname === item.path}
                  />
                </Link>
              )}
              
              {hasSubItems && isExpanded && !collapsed && (
                <div className="mr-4 mt-1 border-r pr-2 border-sidebar-border space-y-1 animate-fade-in">
                  {item.subItems!.map(subItem => (
                    <Link key={subItem.title} to={subItem.path}>
                      <SidebarItem
                        title={subItem.title}
                        icon={subItem.icon}
                        path={subItem.path}
                        isActive={
                          subItem.path === "/orders" 
                            ? location.pathname === "/orders" && !location.pathname.includes('/returned')
                            : location.pathname.includes(subItem.path)
                        }
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
