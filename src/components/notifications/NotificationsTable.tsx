
import { ReactElement } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Trash, MailOpen, Calendar } from "lucide-react";
import { NotificationType } from "@/types/notification";
import { NotificationTypeIcon, getTypeTranslation, getPriorityTranslation } from "./NotificationTypeIcon";

// Priority badge map
const priorityBadgeMap: Record<string, string> = {
  high: "bg-red-100 text-red-800 hover:bg-red-200",
  medium: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  low: "bg-green-100 text-green-800 hover:bg-green-200",
};

type NotificationsTableProps = {
  notifications: NotificationType[];
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
};

export const NotificationsTable = ({
  notifications,
  markAsRead,
  deleteNotification,
}: NotificationsTableProps): ReactElement => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">عنوان</TableHead>
            <TableHead className="w-[35%]">پیام</TableHead>
            <TableHead>نوع</TableHead>
            <TableHead>فوریت</TableHead>
            <TableHead>تاریخ</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                <div className="flex flex-col items-center">
                  <MailOpen className="h-10 w-10 mb-2" />
                  <p>هیچ اعلانی یافت نشد</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notification) => (
              <TableRow key={notification.id} className={notification.read ? "" : "bg-blue-50/50 dark:bg-blue-900/10"}>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    {notification.title}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{notification.message}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <NotificationTypeIcon type={notification.type} className="h-4 w-4 text-muted-foreground" />
                    <span>{getTypeTranslation(notification.type)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${priorityBadgeMap[notification.priority]}`}>
                    {getPriorityTranslation(notification.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {notification.date}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => markAsRead(notification.id)}
                        title="علامت‌گذاری به‌عنوان خوانده‌شده"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotification(notification.id)}
                      title="حذف اعلان"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
