
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { motion } from "framer-motion";

export default function Settings() {
  return (
    <div className="space-y-6 py-6">
      <motion.div 
        className="flex items-center justify-between" 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          تنظیمات
        </h2>
      </motion.div>
      
      <Tabs defaultValue="general" dir="rtl" className="mt-8">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px] p-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-vazirmatn"
          >
            عمومی
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-vazirmatn"
          >
            اعلان‌ها
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-vazirmatn"
          >
            پرداخت‌ها
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-vazirmatn"
          >
            امنیت
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-vazirmatn"
          >
            ظاهر
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-4">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6 space-y-4">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6 space-y-4">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6 space-y-4">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
