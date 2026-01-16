// hooks/useMessage.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  type Message,
  type MessagesResponse,
  type ConversationsResponse,
} from "@/types/message";
import { toast } from "sonner";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get<ConversationsResponse>("/messages");
      return response.data;
    },
    refetchInterval: 10000, // Tự động làm mới mỗi 10s
  });
};

// 2. Lấy nội dung tin nhắn với 1 người cụ thể (Cửa sổ chat bên phải)
export const useChatMessages = (userId: string | null) => {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!userId) return null;
      // Mặc định lấy 50 tin nhắn mới nhất
      const response = await api.get<MessagesResponse>(`/messages/${userId}`, {
        params: { page: 1, limit: 50 },
      });

      const sortedMessages = response.data.data.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      // Đảo ngược mảng để tin nhắn cũ nhất lên đầu (hiển thị từ trên xuống dưới)
      // Tuỳ vào API của bạn trả về thứ tự nào, nếu API trả về cũ nhất trước thì không cần reverse
      return {
        ...response.data,
        data: sortedMessages,
      };
    },
    enabled: !!userId, // Chỉ gọi khi đã chọn user
    refetchInterval: 5000, // Tự động làm mới mỗi 5s để xem tin nhắn họ gửi đến
  });
};

// 3. Gửi tin nhắn
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      content,
    }: {
      userId: string;
      content: string;
    }) => {
      const response = await api.post(`/messages/${userId}`, { content });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 1. Refresh lại cửa sổ chat hiện tại để hiện tin nhắn vừa gửi
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.userId],
      });
      // 2. Refresh lại danh sách inbox để cập nhật "last_message"
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast.error("Gửi tin nhắn thất bại");
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["messages", "unread", "count"],
    queryFn: async () => {
      const response = await api.get<{ unread: number }>(
        "/messages/unread/count"
      );
      return response.data; // Trả về { unread: 7 }
    },
    refetchInterval: 30000, // Check mỗi 30s
  });
};

// 5. MỚI: Đánh dấu đã đọc tin nhắn của 1 user
export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.patch(`/messages/read/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh lại danh sách conversations để số badge đỏ bên sidebar biến mất
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Refresh lại số tổng chưa đọc toàn cục
      queryClient.invalidateQueries({
        queryKey: ["messages", "unread", "count"],
      });
    },
  });
};

// 6. MỚI: Xóa tin nhắn
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/messages/${messageId}`);
    },
    onSuccess: (_, messageId) => {
      toast.success("Đã xóa tin nhắn");
      // Invalidate tất cả các query messages liên quan để cập nhật UI ngay lập tức
      // Lưu ý: Cần invalidate chính xác query key đang active
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] }); // Cập nhật lại last_message nếu lỡ xóa tin cuối
    },
    onError: () => {
      toast.error("Không thể xóa tin nhắn");
    },
  });
};
