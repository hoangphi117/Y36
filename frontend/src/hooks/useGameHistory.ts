// src/hooks/useGameHistory.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "@/lib/axios"; // hoặc đường dẫn axios của bạn
import { type GameHistoryResponse } from "@/types/game";
import { toast } from "sonner";

// Định nghĩa type cho bộ lọc
interface HistoryFilters {
  status?: "playing" | "completed" | "saved";
  gameId?: number;
}

export const useGameHistory = (
  initialPage = 1,
  limit = 10,
  filters?: HistoryFilters // Thêm tham số filters
) => {
  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();

  // Destructure để lấy giá trị cho vào queryKey
  const status = filters?.status;
  const gameId = filters?.gameId;

  const historyQuery = useQuery({
    // QUAN TRỌNG: Thêm status và gameId vào key.
    // Khi filters thay đổi, React Query sẽ tự gọi lại API.
    queryKey: ["sessions", "history", page, limit, status, gameId],

    queryFn: async () => {
      const res = await api.get<GameHistoryResponse>("/sessions/history", {
        params: {
          page,
          limit,
          status, // Gửi status lên server
          gameId, // Gửi gameId lên server (nếu có)
        },
      });
      return res.data;
    },
    staleTime: 1000 * 60, // 1 phút
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast.success("Đã xóa lịch sử đấu.");
      // Invalidate đúng queryKey để refresh list
      queryClient.invalidateQueries({ queryKey: ["sessions", "history"] });
    },
    onError: () => {
      toast.error("Không thể xóa, vui lòng thử lại.");
    },
  });

  return {
    ...historyQuery,
    page,
    setPage,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
