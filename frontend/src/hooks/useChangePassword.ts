import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { type ChangePasswordValues } from "@/lib/schemas";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordValues) => {
      const response = await api.put("/users/me/password", data);

      return response.data;
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!", { duration: 1500 });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(message);
      console.error("Change Password Error:", error);
    },
  });
};
