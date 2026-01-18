import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { UserRating, AverageRatingResponse } from "@/types/rating";

export const useMyRating = (gameId: number) => {
  return useQuery({
    queryKey: ["rating", "me", gameId],
    queryFn: async () => {
      try {
        const response = await api.get<UserRating>(`/rating/${gameId}/me`);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });
};

export const useAverageRating = (gameId: number) => {
  return useQuery({
    queryKey: ["rating", "average", gameId],
    queryFn: async () => {
      const response = await api.get<AverageRatingResponse>(
        `/rating/${gameId}/average`,
      );
      return response.data;
    },
  });
};

export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      rating,
    }: {
      gameId: number;
      rating: number;
    }) => {
      const response = await api.post(`/rating/${gameId}`, { rating });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Cảm ơn bạn đã đánh giá!");

      queryClient.invalidateQueries({
        queryKey: ["rating", "me", variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: ["rating", "average", variables.gameId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi đánh giá");
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: number) => {
      await api.delete(`/rating/${gameId}`);
    },
    onSuccess: (_, gameId) => {
      toast.success("Đã xóa đánh giá");
      queryClient.invalidateQueries({ queryKey: ["rating", "me", gameId] });
      queryClient.invalidateQueries({
        queryKey: ["rating", "average", gameId],
      });
    },
  });
};
