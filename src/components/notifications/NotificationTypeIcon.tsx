
import { 
  AlertCircle, 
  Info, 
  Package, 
  ShoppingCart, 
  UserPlus 
} from "lucide-react";
import { ReactElement } from "react";

// Type icon map
const typeIconMap: Record<string, React.ElementType> = {
  inventory: Package,
  order: ShoppingCart,
  user: UserPlus,
  return: ShoppingCart,
  system: AlertCircle,
  promotion: Info,
};

type NotificationTypeIconProps = {
  type: string;
  className?: string;
};

export const NotificationTypeIcon = ({ type, className }: NotificationTypeIconProps): ReactElement => {
  const Icon = typeIconMap[type] || Info;
  return <Icon className={className} />;
};

export const getTypeTranslation = (type: string): string => {
  switch(type) {
    case "inventory": return "انبار";
    case "order": return "سفارش";
    case "user": return "کاربر";
    case "return": return "مرجوعی";
    case "system": return "سیستم";
    case "promotion": return "تخفیف";
    default: return type;
  }
};

export const getPriorityTranslation = (priority: string): string => {
  switch(priority) {
    case "high": return "بالا";
    case "medium": return "متوسط";
    case "low": return "پایین";
    default: return priority;
  }
};
