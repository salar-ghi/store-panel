
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

export function GeneralSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-gradient font-display">اطلاعات فروشگاه</CardTitle>
          <CardDescription className="font-vazirmatn">
            بروزرسانی جزئیات و تنظیمات فروشگاه
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="store-name" className="font-vazirmatn">نام فروشگاه</Label>
            <Input 
              id="store-name" 
              defaultValue="فروشگاه عالی من" 
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store-email" className="font-vazirmatn">آدرس ایمیل</Label>
            <Input 
              id="store-email" 
              defaultValue="contact@myawesomestore.com" 
              className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store-currency" className="font-vazirmatn">واحد پول</Label>
            <Select defaultValue="irr">
              <SelectTrigger id="store-currency" className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300">
                <SelectValue placeholder="یک واحد پول انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="font-vazirmatn">
                <SelectItem value="irr">تومان (IRR)</SelectItem>
                <SelectItem value="usd">دلار ($)</SelectItem>
                <SelectItem value="eur">یورو (€)</SelectItem>
                <SelectItem value="gbp">پوند (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store-timezone" className="font-vazirmatn">منطقه زمانی</Label>
            <Select defaultValue="tehran">
              <SelectTrigger id="store-timezone" className="bg-white/50 dark:bg-gray-900/50 focus:ring-2 ring-primary/50 transition-all duration-300">
                <SelectValue placeholder="یک منطقه زمانی انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="font-vazirmatn">
                <SelectItem value="tehran">تهران (GMT+3:30)</SelectItem>
                <SelectItem value="est">شرق آمریکا (EST)</SelectItem>
                <SelectItem value="cst">مرکز آمریکا (CST)</SelectItem>
                <SelectItem value="mst">کوهستان آمریکا (MST)</SelectItem>
                <SelectItem value="pst">غرب آمریکا (PST)</SelectItem>
                <SelectItem value="utc">زمان جهانی هماهنگ (UTC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-vazirmatn transition-all duration-300 hover:scale-[1.02]">
            ذخیره تغییرات
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
