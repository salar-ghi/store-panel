
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettingItem } from "./NotificationSettingItem";

interface NotificationSettingsListProps {
  settings: Array<any>;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  toggleSetting: (id: string, channel: string) => void;
}

export const NotificationSettingsList: React.FC<NotificationSettingsListProps> = ({
  settings,
  currentTab,
  setCurrentTab,
  toggleSetting,
}) => {
  const filteredSettings = currentTab === "all"
    ? settings
    : settings.filter(setting => setting[currentTab]);

  return (
    <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full" dir="rtl">
      <TabsList className="grid grid-cols-5 h-auto">
        <TabsTrigger value="all">همه</TabsTrigger>
        <TabsTrigger value="email">ایمیل</TabsTrigger>
        <TabsTrigger value="push">پوش</TabsTrigger>
        <TabsTrigger value="sms">پیامک</TabsTrigger>
        <TabsTrigger value="inApp">درون برنامه‌ای</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <div className="space-y-6">
          {filteredSettings.map((setting) => (
            <NotificationSettingItem 
              key={setting.id}
              setting={setting}
              currentTab={currentTab}
              toggleSetting={toggleSetting}
            />
          ))}
          
          {filteredSettings.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              هیچ تنظیم اعلانی برای این کانال یافت نشد
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="email" className="mt-0">
        <div className="space-y-6">
          {filteredSettings
            .filter((setting) => setting.email)
            .map((setting) => (
              <NotificationSettingItem 
                key={setting.id}
                setting={setting}
                currentTab={currentTab}
                toggleSetting={toggleSetting}
              />
            ))}
          {filteredSettings.filter((setting) => setting.email).length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              هیچ تنظیم اعلانی برای ایمیل یافت نشد
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="push" className="mt-0">
        <div className="space-y-6">
          {filteredSettings
            .filter((setting) => setting.push)
            .map((setting) => (
              <NotificationSettingItem 
                key={setting.id}
                setting={setting}
                currentTab={currentTab}
                toggleSetting={toggleSetting}
              />
            ))}
          {filteredSettings.filter((setting) => setting.push).length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              هیچ تنظیم اعلانی برای پوش یافت نشد
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="sms" className="mt-0">
        <div className="space-y-6">
          {filteredSettings
            .filter((setting) => setting.sms)
            .map((setting) => (
              <NotificationSettingItem 
                key={setting.id}
                setting={setting}
                currentTab={currentTab}
                toggleSetting={toggleSetting}
              />
            ))}
          {filteredSettings.filter((setting) => setting.sms).length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              هیچ تنظیم اعلانی برای پیامک یافت نشد
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="inApp" className="mt-0">
        <div className="space-y-6">
          {filteredSettings
            .filter((setting) => setting.inApp)
            .map((setting) => (
              <NotificationSettingItem 
                key={setting.id}
                setting={setting}
                currentTab={currentTab}
                toggleSetting={toggleSetting}
              />
            ))}
          {filteredSettings.filter((setting) => setting.inApp).length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              هیچ تنظیم اعلانی برای درون برنامه‌ای یافت نشد
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
