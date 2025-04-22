
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    orders: true,
    inventory: true,
    reviews: false
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-gradient font-display">تنظیمات اعلان‌ها</CardTitle>
          <CardDescription className="font-vazirmatn">
            سفارشی‌سازی زمان و نحوه دریافت اعلان‌ها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="notify-orders" 
              checked={notifications.orders}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, orders: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="notify-orders"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                سفارش‌های جدید
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                دریافت اعلان هنگام ثبت سفارش‌های جدید
              </p>
            </div>
            
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="notify-products" 
              checked={notifications.inventory}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, inventory: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="notify-products"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                موجودی کم
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                دریافت اعلان هنگامی که موجودی محصولات کم است.
              </p>
            </div>
            
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="notify-reviews" 
              checked={notifications.reviews}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, reviews: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="notify-reviews"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                نظرات مشتریان
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                دریافت اعلان برای نظرات جدید محصولات.
              </p>
            </div>
            
          </motion.div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-vazirmatn transition-all duration-300 hover:scale-[1.02]">
            ذخیره تنظیمات
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
