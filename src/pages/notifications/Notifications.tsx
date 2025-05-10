
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { mockNotifications } from "@/data/mockNotifications";
import { NotificationType } from "@/types/notification";
import { NotificationsSidebar } from "@/components/notifications/NotificationsSidebar";
import { NotificationsContent } from "@/components/notifications/NotificationsContent";

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>(mockNotifications);
  const [currentTab, setCurrentTab] = useState("all");

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    toast.success("اعلان به‌عنوان خوانده‌شده علامت‌گذاری شد");
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
    toast.success("تمامی اعلان‌ها به‌عنوان خوانده‌شده علامت‌گذاری شدند");
  };

  const deleteNotification = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.id !== id)
    );
    toast.success("اعلان با موفقیت حذف شد");
  };

  const filteredNotifications = notifications.filter(notif => {
    if (currentTab === "all") return true;
    if (currentTab === "unread") return !notif.read;
    return notif.type === currentTab;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">اعلان‌ها</h2>
          <p className="text-muted-foreground">مدیریت و مشاهده اعلان‌های سیستم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <NotificationsSidebar 
          notifications={notifications}
          unreadCount={unreadCount}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <NotificationsContent 
          notifications={notifications}
          filteredNotifications={filteredNotifications}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
}
