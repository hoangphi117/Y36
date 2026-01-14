import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function LoginPage() {
  useDocumentTitle("Đăng Nhập");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("Login Data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-500">
      <div className="w-full max-w-md bg-card p-8 rounded-[2rem] shadow-2xl border-2 border-border/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary uppercase tracking-wide mb-2">
            Chào Mừng Trở Lại
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Đăng nhập để tiếp tục hành trình
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-muted-foreground hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <RoundButton
              type="submit"
              variant="accent"
              size="large"
              className="w-full mt-2"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng Nhập"}
              {!form.formState.isSubmitting && (
                <LogIn className="w-5 h-5 ml-2" />
              )}
            </RoundButton>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            to="/auth/register"
            className="text-primary hover:underline font-bold"
          >
            Đăng ký ngay
          </Link>
        </div>
        <Link
          to="/"
          className="flex flex-row justify-center items-center text-muted-foreground hover:underline font-bold mt-2"
        >
          <ArrowLeft size={18} /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
