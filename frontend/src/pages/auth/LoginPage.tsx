import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react";
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
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  useDocumentTitle("Đăng Nhập");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: handleLogin, isPending, isError, error } = useLogin();

  const onSubmit = async (data: LoginFormValues) => {
    handleLogin(data);
  };

  const errorMessage =
    (error as any)?.response?.data?.message ||
    "Đăng nhập thất bại. Vui lòng thử lại";

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
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-muted-foreground z-10"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <FormMessage className="text-xs font-bold text-destructive ml-1" />
                </FormItem>
              )}
            />

            {isError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
                <p className="text-xs font-bold text-destructive text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <RoundButton
              type="submit"
              variant="accent"
              size="large"
              className="w-full"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? "Đang xử lý..." : "Đăng Nhập"}
              {!isPending && <LogIn className="w-5 h-5 ml-2" />}
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
