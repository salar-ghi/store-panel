
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info, 
  Package, 
  ShoppingCart, 
  UserPlus,
  Clock, 
  Calendar,
  ChevronRight,
  ChevronLeft, 
  Trash,
  MailOpen
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    title: "کمبود موجودی انبار",
    message: "موجودی محصول «گوشی سامسونگ A52» به کمتر از حد تعیین شده رسیده است",
    type: "inventory",
    priority: "high",
    read: false,
    date: "1402/02/23 13:45"
  },
  {
    id: 2,
    title: "سفارش جدید",
    message: "یک سفارش جدید به مبلغ 2,500,000 تومان دریافت شد",
    type: "order",
    priority: "medium",
    read: false,
    date: "1402/02/23 10:20"
  },
  {
    id: 3,
    title: "کاربر جدید",
    message: "کاربر جدیدی با ایمیل example@example.com ثبت نام کرد",
    type: "user",
    priority: "low",
    read: true,
    date: "1402/02/22 16:30"
  },
  {
    id: 4,
    title: "مرجوعی جدید",
    message: "یک درخواست مرجوعی برای سفارش RET-003 ثبت شده است",
    type: "return",
    priority: "medium",
    read: false,
    date: "1402/02/22 14:15"
  },
  {
    id: 5,
    title: "خطای سیستم",
    message: "خطایی در پردازش پرداخت برای سفارش ORD-7851 رخ داده است",
    type: "system",
    priority: "high",
    read: true,
    date: "1402/02/22 09:05"
  },
  {
    id: 6,
    title: "تغییر قیمت",
    message: "قیمت 5 محصول به‌روزرسانی شد. لطفا بررسی کنید.",
    type: "inventory",
    priority: "medium",
    read: true,
    date: "1402/02/21 17:40"
  },
  {
    id: 7,
    title: "تخفیف جدید",
    message: "کد تخفیف SUMMER30 با موفقیت ایجاد و فعال شد",
    type: "promotion",
    priority: "medium",
    read: true,
    date: "1402/02/21 11:55"
  },
];

// Type icon map
const typeIconMap: Record<string, React.ElementType> = {
  inventory: Package,
  order: ShoppingCart,
  user: UserPlus,
  return: ShoppingCart,
  system: AlertCircle,
  promotion: Info,
};

// Priority badge map
const priorityBadgeMap: Record<string, string> = {
  high: "bg-red-100 text-red-800 hover:bg-red-200",
  medium: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  low: "bg-green-100 text-green-800 hover:bg-green-200",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
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
                  const TypeIcon = typeIconMap[type];
                  const typeCount = notifications.filter(n => n.type === type).length;
                  return (
                    <div key={type} 
                      className="flex justify-between items-center p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                      onClick={() => setCurrentTab(type)}
                    >
                      <div className="flex items-center gap-2">
                        {TypeIcon && <TypeIcon className="h-4 w-4" />}
                        <span>{type === "inventory" ? "انبار" : 
                              type === "order" ? "سفارشات" :
                              type === "user" ? "کاربران" :
                              type === "return" ? "مرجوعی‌ها" :
                              type === "system" ? "سیستم" :
                              "تخفیف‌ها"}</span>
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
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === "high" && !n.read).length}
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setCurrentTab("all")}>
              نمایش همه اعلان‌ها
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-3">
          <CardHeader className="pb-2">
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
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
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab}>
              <TabsContent value={currentTab} className="mt-0">
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
                      {filteredNotifications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            <div className="flex flex-col items-center">
                              <MailOpen className="h-10 w-10 mb-2" />
                              <p>هیچ اعلانی یافت نشد</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNotifications.map((notification) => {
                          const TypeIcon = typeIconMap[notification.type];
                          return (
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
                                  {TypeIcon && <TypeIcon className="h-4 w-4 text-muted-foreground" />}
                                  <span>
                                    {notification.type === "inventory" ? "انبار" : 
                                    notification.type === "order" ? "سفارش" :
                                    notification.type === "user" ? "کاربر" :
                                    notification.type === "return" ? "مرجوعی" :
                                    notification.type === "system" ? "سیستم" :
                                    "تخفیف"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${priorityBadgeMap[notification.priority]}`}>
                                  {notification.priority === "high" ? "بالا" : 
                                  notification.priority === "medium" ? "متوسط" : "پایین"}
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredNotifications.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      نمایش {filteredNotifications.length} از {notifications.length} مورد
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" disabled>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8">
                        1
                      </Button>
                      <Button variant="outline" size="icon" disabled>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
