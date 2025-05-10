
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, PackageCheck, Truck, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";

export default function Inventory() {
  const navigate = useNavigate();

  const inventoryStats = [
    { 
      title: "کل موجودی", 
      value: "1,256", 
      icon: Box, 
      change: "+12%", 
      trend: "up", 
      path: "/inventory"
    },
    { 
      title: "مکان‌های انبار", 
      value: "8", 
      icon: PackageCheck, 
      change: "", 
      trend: "neutral", 
      path: "/inventory/locations"
    },
    { 
      title: "ثبت ورودی", 
      value: "24", 
      icon: Truck, 
      change: "+5", 
      trend: "up", 
      path: "/inventory/inputs" 
    },
    { 
      title: "کمبود موجودی", 
      value: "17", 
      icon: AlertTriangle, 
      change: "-3", 
      trend: "down", 
      path: "/inventory/low-stock" 
    }
  ];

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مدیریت انبار</h1>
          <p className="text-muted-foreground">کنترل و مدیریت موجودی محصولات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            بروزرسانی موجودی
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border ${
              stat.title === "کمبود موجودی" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50" : 
              "bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
            }`}
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-lg">{stat.title}</CardTitle>
              <stat.icon className={`h-6 w-6 ${
                stat.title === "کمبود موجودی" ? "text-red-500" : "text-blue-500"
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              {stat.change && (
                <div className={`flex items-center mt-2 text-sm ${
                  stat.trend === "up" ? "text-green-600 dark:text-green-400" : 
                  stat.trend === "down" ? "text-red-600 dark:text-red-400" : ""
                }`}>
                  {stat.trend === "up" && <TrendingUp className="h-4 w-4 mr-1" />}
                  {stat.trend === "down" && <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />}
                  {stat.change}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle>محصولات با بیشترین موجودی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                      <Box className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">محصول {i + 1}</div>
                      <div className="text-sm text-muted-foreground">انبار مرکزی</div>
                    </div>
                  </div>
                  <div className="font-bold">{120 - i * 15}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle>آخرین فعالیت‌های انبار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                      i % 2 === 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                    }`}>
                      {i % 2 === 0 ? (
                        <Truck className="h-5 w-5 text-green-500" />
                      ) : (
                        <Box className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {i % 2 === 0 ? "ورود محموله" : "خروج کالا"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {`${3 - i} ساعت پیش`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {i % 2 === 0 ? "+20 واحد" : "-5 واحد"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
