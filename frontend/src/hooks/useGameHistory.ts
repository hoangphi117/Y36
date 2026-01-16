import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { type GameHistoryResponse } from "@/types/game";
import { toast } from "sonner";

export const useGameHistory = (initialPage = 1, limit = 10) => {
  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["sessions", "history", page, limit],
    queryFn: async () => {
      const res = await api.get<GameHistoryResponse>("/sessions/history", {
        params: { page, limit },
      });
      return res.data;
    },
    staleTime: 1000 * 60,
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast.success("Đã xóa lịch sử đấu.");
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
