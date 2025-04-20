
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/theme-store";
import { motion } from "framer-motion";
import { useColorStore } from "@/store/color-store";
import { useToast } from "@/hooks/use-toast";

const PRESET_COLORS = [
  { name: "بنفش", primary: "#9b87f5", secondary: "#7E69AB" },
  { name: "آبی", primary: "#0ea5e9", secondary: "#0284c7" },
  { name: "سبز", primary: "#10b981", secondary: "#059669" },
  { name: "قرمز", primary: "#ef4444", secondary: "#dc2626" },
  { name: "نارنجی", primary: "#f97316", secondary: "#ea580c" },
  { name: "صورتی", primary: "#ec4899", secondary: "#db2777" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useThemeStore();
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } = useColorStore();
  const { toast } = useToast();
  const [customPrimary, setCustomPrimary] = useState(primaryColor);
  const [customSecondary, setCustomSecondary] = useState(secondaryColor);

  const applyColors = () => {
    setPrimaryColor(customPrimary);
    setSecondaryColor(customSecondary);
    
    toast({
      title: "تنظیمات ظاهری بروزرسانی شد",
      description: "رنگ‌های جدید با موفقیت اعمال شدند",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-gradient font-display">تنظیمات ظاهری</CardTitle>
          <CardDescription className="font-vazirmatn">
            سفارشی‌سازی نمایش و ظاهر اپلیکیشن خود
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="font-vazirmatn">حالت نمایش</Label>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme("light")}
                className={`cursor-pointer rounded-lg p-4 flex flex-col items-center gap-3 ${
                  theme === "light" 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "bg-white/20 dark:bg-gray-700/40"
                } transition-all duration-300`}
              >
                <div className="w-full h-24 rounded-md bg-white dark:bg-gray-200 overflow-hidden shadow-md">
                  <div className="h-6 bg-gray-100 dark:bg-gray-300 flex items-center justify-end px-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-400 mr-1"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-400 mr-1"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-400"></div>
                  </div>
                  <div className="p-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-400 rounded-full mb-2"></div>
                    <div className="w-2/3 h-2 bg-gray-200 dark:bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                <span className="font-vazirmatn text-sm">روشن</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme("dark")}
                className={`cursor-pointer rounded-lg p-4 flex flex-col items-center gap-3 ${
                  theme === "dark" 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "bg-white/20 dark:bg-gray-700/40"
                } transition-all duration-300`}
              >
                <div className="w-full h-24 rounded-md bg-gray-800 overflow-hidden shadow-md">
                  <div className="h-6 bg-gray-900 flex items-center justify-end px-2">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-1"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-1"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                  </div>
                  <div className="p-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full mb-2"></div>
                    <div className="w-2/3 h-2 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
                <span className="font-vazirmatn text-sm">تیره</span>
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="font-vazirmatn">رنگ اصلی</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <motion.div
                  key={color.primary}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full aspect-square rounded-full cursor-pointer transition-all duration-300 ${
                    customPrimary === color.primary ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""
                  }`}
                  style={{ backgroundColor: color.primary }}
                  onClick={() => {
                    setCustomPrimary(color.primary);
                    setCustomSecondary(color.secondary);
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-vazirmatn">رنگ اصلی سفارشی</Label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <input 
                  type="text" 
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-gray-900/50 rounded-md p-2 text-sm border border-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-vazirmatn">رنگ ثانویه سفارشی</Label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <input 
                  type="text" 
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-gray-900/50 rounded-md p-2 text-sm border border-input"
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-4 bg-white/20 dark:bg-gray-700/20">
            <div className="font-vazirmatn font-medium mb-2">پیش‌نمایش رنگ‌ها</div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 h-12 rounded-md transition-all duration-300"
                style={{ backgroundColor: customPrimary }}
              ></motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 h-12 rounded-md transition-all duration-300"
                style={{ backgroundColor: customSecondary }}
              ></motion.div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={applyColors}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-vazirmatn transition-all duration-300 hover:scale-[1.02]"
          >
            اعمال تغییرات
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
