import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Package, 
  ShoppingCart,
  User,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  icon: React.ElementType;
}

const initialSettings: NotificationSetting[] = [
  {
    id: "order_status",
    title: "وضعیت سفارش",
    description: "اطلاع‌رسانی در مورد تغییر وضعیت سفارشات",
    email: true,
    push: true,
    sms: true,
    inApp: true,
    icon: ShoppingCart,
  },
  {
    id: "inventory_alerts",
    title: "هشدار موجودی کالا",
    description: "اطلاع‌رسانی در مورد کمبود موجودی محصولات",
    email: true,
    push: true,
    sms: false,
    inApp: true,
    icon: Package,
  },
  {
    id: "customer_messages",
    title: "پیام‌های مشتریان",
    description: "دریافت پیام‌های جدید از مشتریان",
    email: true,
    push: true,
    sms: false,
    inApp: true,
    icon: MessageSquare,
  },
  {
    id: "user_registration",
    title: "ثبت‌نام کاربران",
    description: "اطلاع‌رسانی درباره کاربران جدید ثبت‌نام شده",
    email: true,
    push: false,
    sms: false,
    inApp: true,
    icon: User,
  },
  {
    id: "system_alerts",
    title: "هشدارهای سیستمی",
    description: "خطاها و مشکلات سیستم",
    email: true,
    push: true,
    sms: true,
    inApp: true,
    icon: AlertCircle,
  },
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);
  const [currentTab, setCurrentTab] = useState("all");
  const [emailDigestFrequency, setEmailDigestFrequency] = useState("daily");
  
  const toggleSetting = (id: string, channel: keyof Omit<NotificationSetting, "id" | "title" | "description" | "icon">) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id 
          ? { ...setting, [channel]: !setting[channel] } 
          : setting
      )
    );
    
    toast.success("تنظیمات اعلان‌ها با موفقیت ذخیره شد");
  };

  const saveAllSettings = () => {
    toast.success("همه تنظیمات اعلان‌ها با موفقیت ذخیره شد");
  };
  
  const toggleAllForType = (type: string, value: boolean) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => ({
        ...setting,
        email: type === "email" ? value : setting.email,
        push: type === "push" ? value : setting.push,
        sms: type === "sms" ? value : setting.sms,
        inApp: type === "inApp" ? value : setting.inApp,
      }))
    );
    
    toast.success(`همه اعلان‌های ${
      type === "email" ? "ایمیل" : 
      type === "push" ? "پوش" :
      type === "sms" ? "پیامک" :
      "درون برنامه‌ای"
    } ${value ? "فعال" : "غیرفعال"} شدند`);
  };
  
  const filteredSettings = currentTab === "all" 
    ? settings 
    : settings.filter(setting => setting[currentTab as keyof Omit<NotificationSetting, "id" | "title" | "description" | "icon">]);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تنظیمات اعلان‌ها</h2>
          <p className="text-muted-foreground">مدیریت نحوه اطلاع‌رسانی و اعلان‌های سیستم</p>
        </div>
        <Button onClick={saveAllSettings} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          ذخیره تنظیمات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              کانال‌های اعلان‌رسانی
            </CardTitle>
            <CardDescription>تنظیمات انواع مختلف اعلان‌ها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">اعلان‌های ایمیلی</h4>
                    <p className="text-sm text-muted-foreground">ارسال اعلان‌ها به ایمیل شما</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Switch
                    id="email-notifications"
                    checked={settings.some(s => s.email)}
                    onCheckedChange={(checked) => toggleAllForType("email", checked)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="font-medium">اعلان‌های پوش</h4>
                    <p className="text-sm text-muted-foreground">اعلان‌های درون مرورگر و دسکتاپ</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Switch
                    id="push-notifications"
                    checked={settings.some(s => s.push)}
                    onCheckedChange={(checked) => toggleAllForType("push", checked)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">اعلان‌های پیامکی</h4>
                    <p className="text-sm text-muted-foreground">ارسال پیامک به شماره موبایل</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Switch
                    id="sms-notifications"
                    checked={settings.some(s => s.sms)}
                    onCheckedChange={(checked) => toggleAllForType("sms", checked)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">اعلان‌های درون برنامه‌ای</h4>
                    <p className="text-sm text-muted-foreground">نمایش اعلان در داشبورد مدیریت</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Switch
                    id="in-app-notifications"
                    checked={settings.some(s => s.inApp)}
                    onCheckedChange={(checked) => toggleAllForType("inApp", checked)}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">تنظیمات اضافی</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="email-digest">خلاصه ایمیلی</Label>
                    <p className="text-sm text-muted-foreground">فرکانس دریافت خلاصه اعلان‌ها</p>
                  </div>
                  <Select value={emailDigestFrequency} onValueChange={setEmailDigestFrequency}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="انتخاب فرکانس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">روزانه</SelectItem>
                      <SelectItem value="weekly">هفتگی</SelectItem>
                      <SelectItem value="never">هرگز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="do-not-disturb">حالت مزاحم نشوید</Label>
                    <p className="text-sm text-muted-foreground">خاموش کردن همه اعلان‌ها در ساعات خاص</p>
                  </div>
                  <Switch id="do-not-disturb" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid grid-cols-5 h-auto">
                <TabsTrigger value="all">همه</TabsTrigger>
                <TabsTrigger value="email">ایمیل</TabsTrigger>
                <TabsTrigger value="push">پوش</TabsTrigger>
                <TabsTrigger value="sms">پیامک</TabsTrigger>
                <TabsTrigger value="inApp">درون برنامه‌ای</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="space-y-6">
                  {filteredSettings.map((setting) => {
                    const SettingIcon = setting.icon;
                    return (
                      <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <SettingIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{setting.title}</h4>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-5">
                          {(currentTab === "all" || currentTab === "email") && (
                            <div className="flex flex-col items-center gap-1">
                              <Label htmlFor={`${setting.id}-email`} className="text-xs">ایمیل</Label>
                              <Switch
                                id={`${setting.id}-email`}
                                checked={setting.email}
                                onCheckedChange={() => toggleSetting(setting.id, "email")}
                              />
                            </div>
                          )}
                          
                          {(currentTab === "all" || currentTab === "push") && (
                            <div className="flex flex-col items-center gap-1">
                              <Label htmlFor={`${setting.id}-push`} className="text-xs">پوش</Label>
                              <Switch
                                id={`${setting.id}-push`}
                                checked={setting.push}
                                onCheckedChange={() => toggleSetting(setting.id, "push")}
                              />
                            </div>
                          )}
                          
                          {(currentTab === "all" || currentTab === "sms") && (
                            <div className="flex flex-col items-center gap-1">
                              <Label htmlFor={`${setting.id}-sms`} className="text-xs">پیامک</Label>
                              <Switch
                                id={`${setting.id}-sms`}
                                checked={setting.sms}
                                onCheckedChange={() => toggleSetting(setting.id, "sms")}
                              />
                            </div>
                          )}
                          
                          {(currentTab === "all" || currentTab === "inApp") && (
                            <div className="flex flex-col items-center gap-1">
                              <Label htmlFor={`${setting.id}-inApp`} className="text-xs">درون برنامه‌ای</Label>
                              <Switch
                                id={`${setting.id}-inApp`}
                                checked={setting.inApp}
                                onCheckedChange={() => toggleSetting(setting.id, "inApp")}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredSettings.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground">
                      هیچ تنظیم اعلانی برای این کانال یافت نشد
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="mt-0">
                <div className="space-y-6">
                  {/* Similar content to "all" tab but filtered for email */}
                  {/* ... keep existing code or implement similar structure as "all" tab */}
                </div>
              </TabsContent>
              
              <TabsContent value="push" className="mt-0">
                <div className="space-y-6">
                  {/* ... keep existing code or implement similar structure as "all" tab */}
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="mt-0">
                <div className="space-y-6">
                  {/* ... keep existing code or implement similar structure as "all" tab */}
                </div>
              </TabsContent>
              
              <TabsContent value="inApp" className="mt-0">
                <div className="space-y-6">
                  {/* ... keep existing code or implement similar structure as "all" tab */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
