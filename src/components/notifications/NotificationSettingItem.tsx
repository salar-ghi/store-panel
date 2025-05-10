
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSettingItemProps {
  setting: {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    [key: string]: any;
  };
  currentTab: string;
  toggleSetting: (id: string, channel: string) => void;
}

export const NotificationSettingItem: React.FC<NotificationSettingItemProps> = ({
  setting,
  currentTab,
  toggleSetting,
}) => {
  const SettingIcon = setting.icon;

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
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
};
