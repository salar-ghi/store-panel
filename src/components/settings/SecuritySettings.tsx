
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useState } from "react";

export function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-gradient font-display">تنظیمات امنیتی</CardTitle>
          <CardDescription className="font-vazirmatn">
            مدیریت تنظیمات امنیتی حساب کاربری خود
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div 
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Label htmlFor="current-password" className="font-vazirmatn">رمز عبور فعلی</Label>
            <Input 
              id="current-password" 
              type="password" 
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300" 
            />
          </motion.div>
          
          <motion.div 
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Label htmlFor="new-password" className="font-vazirmatn">رمز عبور جدید</Label>
            <Input 
              id="new-password" 
              type="password" 
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300" 
            />
          </motion.div>
          
          <motion.div 
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Label htmlFor="confirm-password" className="font-vazirmatn">تأیید رمز عبور جدید</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300" 
            />
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-2 pt-4"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="two-factor" 
              checked={twoFactor}
              onCheckedChange={(checked) => setTwoFactor(checked === true)}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="two-factor"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                فعال‌سازی احراز هویت دو مرحله‌ای
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                یک لایه امنیتی اضافه به حساب خود اضافه کنید
              </p>
            </div>
            
          </motion.div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-vazirmatn transition-all duration-300 hover:scale-[1.02]">
            بروزرسانی تنظیمات امنیتی
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
