import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas";
import { getPasswordStrength, cn } from "@/lib/utils";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function RegisterPage() {
  useDocumentTitle("Đăng Ký");
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const strength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormValues) => {
    console.log("Register Data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const strengthColor = [
    "bg-muted", // 0: Trống
    "bg-destructive", // 1: Yếu
    "bg-orange-400", // 2: Tạm được
    "bg-primary", // 3: Mạnh
    "bg-green-600", // 4: Rất an toàn
  ][strength];

  const strengthText = ["", "Rất yếu", "Bình thường", "Mạnh", "Rất an toàn"][
    strength
  ];

  const strengthTextColor =
    strength === 0
      ? "text-muted-foreground"
      : strengthColor.replace("bg-", "text-");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-500">
      <div className="w-full max-w-md bg-card p-8 rounded-[2rem] shadow-2xl border-2 border-border/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary uppercase tracking-wide mb-2">
            Tạo Tài Khoản
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Tham gia ngay để bắt đầu trò chơi
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <User className="absolute left-3 top-2 h-5 w-5 text-muted-foreground z-10" />
                    <FormControl>
                      <Input
                        placeholder="Tên hiển thị"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-bold text-destructive ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 h-5 w-5 text-muted-foreground z-10" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-bold text-destructive ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 h-5 w-5 text-muted-foreground z-10" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mật khẩu"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-bold text-destructive ml-1" />
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={cn(
                              "h-full w-1/4 rounded-full transition-all duration-500",
                              strength >= step ? strengthColor : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase italic transition-colors",
                          strengthTextColor
                        )}
                      >
                        <span className="text-muted-foreground">
                          Độ bảo mật:
                        </span>{" "}
                        <span>{strengthText}</span>
                      </p>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* TRƯỜNG XÁC NHẬN MẬT KHẨU */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2 h-5 w-5 text-muted-foreground z-10" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-bold text-destructive ml-1" />
                </FormItem>
              )}
            />

            <RoundButton
              type="submit"
              variant="primary"
              size="large"
              className="w-full mt-4 group"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng Ký Ngay"}
              {!form.formState.isSubmitting && (
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </RoundButton>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm font-medium text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="text-primary hover:underline font-bold"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
