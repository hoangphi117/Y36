import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type {
  CommentsResponse,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@/types/comment";

export const useGetComments = (
  gameId: number,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ["comments", gameId, page],
    queryFn: async () => {
      const response = await api.get<CommentsResponse>(
        `/comments/game/${gameId}`,
        {
          params: { page, limit },
        },
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, content }: CreateCommentPayload) => {
      const response = await api.post(`/comments/game/${gameId}`, {
        content,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Đã đăng bình luận!");

      queryClient.invalidateQueries({
        queryKey: ["comments", variables.gameId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi đăng bình luận");
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: UpdateCommentPayload) => {
      const response = await api.put(`/comments/${id}`, { content });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Đã cập nhật bình luận!");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      toast.success("Đã xóa bình luận!");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    },
  });
};
