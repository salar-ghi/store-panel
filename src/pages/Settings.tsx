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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">تنظیمات</h2>
      </div>
      
      <Tabs defaultValue="general" dir="rtl">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="notifications">اعلان‌ها</TabsTrigger>
          <TabsTrigger value="payments">پرداخت‌ها</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-4">
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
            <CardHeader>
              <CardTitle>اطلاعات فروشگاه</CardTitle>
              <CardDescription>
                بروزرسانی جزئیات و تنظیمات فروشگاه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="store-name">نام فروشگاه</Label>
                <Input id="store-name" defaultValue="فروشگاه عالی من" className="bg-white/50 dark:bg-gray-900/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-email">آدرس ایمیل</Label>
                <Input id="store-email" defaultValue="contact@myawesomestore.com" className="bg-white/50 dark:bg-gray-900/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-currency">واحد پول</Label>
                <Select defaultValue="irr">
                  <SelectTrigger id="store-currency" className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="یک واحد پول انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irr">تومان (IRR)</SelectItem>
                    <SelectItem value="usd">دلار ($)</SelectItem>
                    <SelectItem value="eur">یورو (€)</SelectItem>
                    <SelectItem value="gbp">پوند (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-timezone">منطقه زمانی</Label>
                <Select defaultValue="tehran">
                  <SelectTrigger id="store-timezone" className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="یک منطقه زمانی انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                ذخیره تغییرات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
            <CardHeader>
              <CardTitle>تنظیمات اعلان‌ها</CardTitle>
              <CardDescription>
                سفارشی‌سازی زمان و نحوه دریافت اعلان‌ها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="notify-orders"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    سفارش‌های جدید
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    دریافت اعلان هنگام ثبت سفارش‌های جدید
                  </p>
                </div>
                <Checkbox id="notify-orders" defaultChecked className="ml-2" />
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="notify-products" defaultChecked />
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="notify-products"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    موجودی کم
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    دریافت اعلان هنگامی که موجودی محصولات کم است.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="notify-reviews" />
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="notify-reviews"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    نظرات مشتریان
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    دریافت اعلان برای نظرات جدید محصولات.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                ذخیره تنظیمات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6 space-y-4">
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
            <CardHeader>
              <CardTitle>روش‌های پرداخت</CardTitle>
              <CardDescription>
                پیکربندی روش‌های پرداختی که فروشگاه شما می‌پذیرد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-credit" defaultChecked />
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="payment-credit"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    کارت‌های بانکی
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    پذیرش انواع کارت‌های بانکی شتاب.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-paypal" defaultChecked />
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="payment-paypal"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    درگاه زرین‌پال
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    پذیرش پرداخت از طریق درگاه زرین‌پال.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-apple" />
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="payment-apple"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    کیف پول دیجیتال
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    پذیرش پرداخت از طریق کیف پول دیجیتال.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                ذخیره روش‌های پرداخت
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6 space-y-4">
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
            <CardHeader>
              <CardTitle>تنظیمات امنیتی</CardTitle>
              <CardDescription>
                مدیریت تنظیمات امنیتی حساب کاربری خود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">رمز عبور فعلی</Label>
                <Input id="current-password" type="password" className="bg-white/50 dark:bg-gray-900/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">رمز عبور جدید</Label>
                <Input id="new-password" type="password" className="bg-white/50 dark:bg-gray-900/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">تأیید رمز عبور جدید</Label>
                <Input id="confirm-password" type="password" className="bg-white/50 dark:bg-gray-900/50" />
              </div>
              <div className="flex items-start space-x-2 pt-4">
                <div className="grid gap-1.5 mr-2">
                  <Label
                    htmlFor="two-factor"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    فعال‌سازی احراز هویت دو مرحله‌ای
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    یک لایه امنیتی اضافه به حساب خود اضافه کنید
                  </p>
                </div>
                <Checkbox id="two-factor" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                بروزرسانی تنظیمات امنیتی
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
