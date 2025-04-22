
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

export function PaymentSettings() {
  const [payments, setPayments] = useState({
    creditCard: true,
    zarinpal: true,
    digitalWallet: false
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-gradient font-display">روش‌های پرداخت</CardTitle>
          <CardDescription className="font-vazirmatn">
            پیکربندی روش‌های پرداختی که فروشگاه شما می‌پذیرد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="payment-credit" 
              checked={payments.creditCard}
              onCheckedChange={(checked) => 
                setPayments(prev => ({ ...prev, creditCard: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="payment-credit"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                کارت‌های بانکی
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                پذیرش انواع کارت‌های بانکی شتاب.
              </p>
            </div>
            
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="payment-zarinpal" 
              checked={payments.zarinpal}
              onCheckedChange={(checked) => 
                setPayments(prev => ({ ...prev, zarinpal: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="payment-zarinpal"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                درگاه زرین‌پال
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                پذیرش پرداخت از طریق درگاه زرین‌پال.
              </p>
            </div>
            
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox 
              id="payment-wallet" 
              checked={payments.digitalWallet}
              onCheckedChange={(checked) => 
                setPayments(prev => ({ ...prev, digitalWallet: checked === true }))}
              className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:animate-pulse-once" 
            />
            <div className="grid gap-1.5 mr-2">
              <Label
                htmlFor="payment-wallet"
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-vazirmatn"
              >
                کیف پول دیجیتال
              </Label>
              <p className="text-sm text-muted-foreground font-vazirmatn">
                پذیرش پرداخت از طریق کیف پول دیجیتال.
              </p>
            </div>
            
          </motion.div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-vazirmatn transition-all duration-300 hover:scale-[1.02]">
            ذخیره روش‌های پرداخت
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
