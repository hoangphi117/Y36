import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { type User } from "@/types/user";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { type UpdateProfileValues } from "@/lib/schemas";

const fetchUserProfile = async (): Promise<User> => {
  const response = await api.get("/users/me");
  return response.data;
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setAuth, token } = useAuthStore();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: async (data: UpdateProfileValues) => {
      const response = await api.put("/users/me", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      if (token) {
        setAuth(updatedUser, token);
      }

      console.log("Updatedaaaaaa user:", updatedUser);

      setTheme(updatedUser.user.dark_mode ? "dark" : "light");

      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      toast.success("Cập nhật hồ sơ thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    },
  });
};
