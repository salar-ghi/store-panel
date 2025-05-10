
import { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar } from "lucide-react";
import { NotificationType } from "@/types/notification";
import { NotificationTypeIcon, getTypeTranslation } from "./NotificationTypeIcon";

type NotificationsSidebarProps = {
  notifications: NotificationType[];
  unreadCount: number;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
};

export const NotificationsSidebar = ({
  notifications,
  unreadCount,
  currentTab,
  setCurrentTab,
}: NotificationsSidebarProps): ReactElement => {
  const highPriorityCount = notifications.filter(n => n.priority === "high" && !n.read).length;
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          مرکز اعلان‌ها
        </CardTitle>
        <CardDescription>خلاصه وضعیت اعلان‌ها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-muted-foreground text-sm">اعلان‌های خوانده نشده</div>
          <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
        </div>

        <div>
          <h4 className="font-medium mb-3">اعلان‌ها بر اساس نوع</h4>
          <div className="space-y-2">
            {["inventory", "order", "user", "return", "system", "promotion"].map((type) => {
              const typeCount = notifications.filter(n => n.type === type).length;
              return (
                <div key={type} 
                  className={`flex justify-between items-center p-2 rounded-md ${
                    currentTab === type ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  } cursor-pointer`}
                  onClick={() => setCurrentTab(type)}
                >
                  <div className="flex items-center gap-2">
                    <NotificationTypeIcon type={type} className="h-4 w-4" />
                    <span>{getTypeTranslation(type)}</span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    {typeCount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-muted-foreground text-sm">فوریت‌های بالا</div>
          <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
        </div>

        <Button 
          variant="outline" 
          className={`w-full ${currentTab === "all" ? "bg-blue-100 dark:bg-blue-900/30" : ""}`} 
          onClick={() => setCurrentTab("all")}
        >
          نمایش همه اعلان‌ها
        </Button>
      </CardContent>
    </Card>
  );
};
