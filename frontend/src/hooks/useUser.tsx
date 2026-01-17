import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Friend, FriendsListResponse } from "@/types/friend";
import { type SearchUsersResponse, type User } from "@/types/user";
import { useAuthStore } from "@/stores/useAuthStore";
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
    mutationFn: async (data: UpdateProfileValues | FormData) => {
      const isFormData = data instanceof FormData;
      const config = isFormData
        ? {
            headers: {
              "Content-Type": undefined,
            },
          }
        : {};
      const response = await api.put("/users/me", data, config);
      return response.data;
    },
    onSuccess: (data) => {
      if (token) {
        setAuth(data.user, token);
      }

      setTheme(data.user.dark_mode ? "dark" : "light");

      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      toast.success("Cập nhật hồ sơ thành công!", { duration: 1500 });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    },
  });
};

export const useSearchUsers = (username: string) => {
  return useQuery({
    queryKey: ["users", "search", username],
    queryFn: async () => {
      const response = await api.get<SearchUsersResponse>("/users/search", {
        params: { username },
      });
      return response.data;
    },
    enabled: !!username && username.length > 1,
    staleTime: 1000 * 60,
  });
};

export const useFriendsList = (params: {
  page: number;
  limit: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["friends", "list", params],
    queryFn: async () => {
      const response = await api.get<FriendsListResponse>("/friends/list", {
        params,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useFriendRequests = () => {
  return useQuery({
    queryKey: ["friends", "requests", "incoming"],
    queryFn: async () => {
      const response = await api.get("/friends/requests/incoming");

      return response.data;
    },
  });
};

export const useFriendActions = () => {
  const queryClient = useQueryClient();

  const invalidateFriendData = () => {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
    queryClient.invalidateQueries({ queryKey: ["users", "search"] });
  };

  const sendRequest = useMutation({
    mutationFn: async (userId: string) => {
      return await api.post(`/friends/request/${userId}`);
    },
    onSuccess: () => {
      toast.success("Đã gửi lời mời kết bạn!", { duration: 1500 });
      invalidateFriendData();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi gửi lời mời");
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (userId: string) => {
      return await api.post(`/friends/accept/${userId}`);
    },
    onSuccess: () => {
      toast.success("Đã chấp nhận kết bạn!", { duration: 1500 });
      invalidateFriendData();
    },
    onError: (error: any) => {
      toast.error("Không thể chấp nhận lời mời");
    },
  });

  const rejectRequest = useMutation({
    mutationFn: async (userId: string) => {
      return await api.post(`/friends/reject/${userId}`);
    },
    onSuccess: () => {
      toast.info("Đã từ chối lời mời");
      invalidateFriendData();
    },
    onError: (error: any) => {
      toast.error("Lỗi khi từ chối");
    },
  });

  const unfriend = useMutation({
    mutationFn: async (userId: string) =>
      await api.delete(`/friends/unfriend/${userId}`),
    onSuccess: () => {
      toast.success("Đã hủy kết bạn", { duration: 1500 });
      invalidateFriendData();
    },
    onError: () => toast.error("Lỗi khi hủy kết bạn"),
  });

  const blockUser = useMutation({
    mutationFn: async (userId: string) =>
      await api.post(`/friends/block/${userId}`),
    onSuccess: () => {
      toast.success("Đã chặn người dùng này", { duration: 1500 });
      invalidateFriendData();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi chặn người dùng");
    },
  });

  return {
    sendRequest,
    acceptRequest,
    rejectRequest,
    unfriend,
    blockUser,
  };
};

export const useSentRequests = () => {
  return useQuery({
    queryKey: ["friends", "requests", "outgoing"],
    queryFn: async () => {
      const response = await api.get("/friends/requests/outgoing");
      return response.data;
    },
  });
};
