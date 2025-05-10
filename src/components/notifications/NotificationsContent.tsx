
import { ReactElement } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@/types/notification";
import { NotificationsTable } from "./NotificationsTable";
import { NotificationsPagination } from "./NotificationsPagination";

type NotificationsContentProps = {
  notifications: NotificationType[];
  filteredNotifications: NotificationType[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  unreadCount: number;
};

export const NotificationsContent = ({
  notifications,
  filteredNotifications,
  currentTab,
  setCurrentTab,
  markAsRead,
  deleteNotification,
  unreadCount,
}: NotificationsContentProps): ReactElement => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-3">
      <CardContent className="pt-6">
        <Tabs defaultValue={currentTab} value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="all" className="py-2">
              همه
              <Badge variant="secondary" className="mr-1 ml-0">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="py-2">
              خوانده نشده
              <Badge variant="secondary" className="mr-1 ml-0">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="py-2">انبار</TabsTrigger>
            <TabsTrigger value="order" className="py-2">سفارشات</TabsTrigger>
            <TabsTrigger value="user" className="py-2">کاربران</TabsTrigger>
            <TabsTrigger value="system" className="py-2">سیستم</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-6">
            <NotificationsTable 
              notifications={filteredNotifications} 
              markAsRead={markAsRead} 
              deleteNotification={deleteNotification} 
            />
            
            <NotificationsPagination 
              filteredCount={filteredNotifications.length} 
              totalCount={notifications.length} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
