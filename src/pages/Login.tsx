
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ScanEye } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

const formSchema = z.object({
  PhoneNumber: z.string().min(3, {
    message: "شماره موبایل باید حداقل ۳ کاراکتر باشد.",
  }),
  password: z.string().min(6, {
    message: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
  }),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [peekPassword, setPeekPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      toast.error('نشست شما منقضی شده است، لطفاً دوباره وارد شوید');
    }
  }, [searchParams]);

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      PhoneNumber: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const loginData = {
      PhoneNumber: values.PhoneNumber,
      password: values.password
    };
    
    await login(loginData);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ورود به سیستم</CardTitle>
          <CardDescription>
            برای دسترسی به حساب کاربری خود اطلاعات خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="PhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کاربری خود را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword || peekPassword ? "text" : "password"} placeholder="رمز عبور خود را وارد کنید" className="pl-16" {...field} />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                          {/* <button
                            type="button"
                            onPointerDown={() => setPeekPassword(true)}
                            onPointerUp={() => setPeekPassword(false)}
                            onPointerLeave={() => setPeekPassword(false)}
                            onPointerCancel={() => setPeekPassword(false)}
                            aria-label="برای دیدن رمز عبور نگه دارید"
                            title="برای دیدن رمز عبور نگه دارید"
                            className="absolute left-8 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors select-none"
                          >
                            <ScanEye className="h-4 w-4" />
                          </button> */}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
