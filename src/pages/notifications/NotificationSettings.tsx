
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { NotificationChannels } from "@/components/notifications/NotificationChannels";
import { NotificationSettingsList } from "@/components/notifications/NotificationSettingsList";
import { initialSettings, NotificationSetting } from "@/data/notificationSettingsData";

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
            <NotificationChannels 
              settings={settings}
              emailDigestFrequency={emailDigestFrequency}
              setEmailDigestFrequency={setEmailDigestFrequency}
              toggleAllForType={toggleAllForType}
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <NotificationSettingsList 
              settings={settings}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              toggleSetting={toggleSetting}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
