import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import type { RegisterFormValues, LoginFormValues } from "@/lib/schemas";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const registerApi = async (data: RegisterFormValues) => {
  const { confirmPassword, ...payload } = data;
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (_) => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");
    },
    onError: (error: any) => {
      console.error("Lỗi đăng ký:", error);
    },
  });
};

const loginApi = async (data: LoginFormValues) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const fullUser = {
        ...data.user,
        avatar_url: data.user.avatar_url || "https://github.com/shadcn.png",
        dark_mode: data.user.dark_mode ?? false,
      };

      setAuth(fullUser, data.token);
      setTheme(fullUser.dark_mode ? "dark" : "light");
      toast.success("Đăng nhập thành công!");
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Login Failed:", error);
    },
  });
};
