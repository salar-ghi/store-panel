
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface NotificationChannelsProps {
  settings: Array<{
    id: string;
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  }>;
  emailDigestFrequency: string;
  setEmailDigestFrequency: (value: string) => void;
  toggleAllForType: (type: string, value: boolean) => void;
}

export const NotificationChannels: React.FC<NotificationChannelsProps> = ({
  settings,
  emailDigestFrequency,
  setEmailDigestFrequency,
  toggleAllForType,
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};
