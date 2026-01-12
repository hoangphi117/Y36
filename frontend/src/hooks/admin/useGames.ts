import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/admin/gameService';
import type { GameFilters, UpdateGamePayload, Game } from '@/services/admin/gameService';
import { showToast } from '@/components/admin/ui/Toast';

export const useGames = (filters: GameFilters = {}) => {
  return useQuery({
    queryKey: ['admin-games', filters],
    queryFn: () => gameService.getGames(filters),
    retry: 1,
    staleTime: 5000,
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGamePayload }) =>
      gameService.updateGame(id, payload),
    
    // Optimistic Update - Update UI immediately before API call
    onMutate: async ({ id, payload }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-games'] });

      // Snapshot the previous value
      const previousGames = queryClient.getQueriesData({ queryKey: ['admin-games'] });

      // Optimistically update all matching queries
      queryClient.setQueriesData(
        { queryKey: ['admin-games'] },
        (old: any) => {
          if (!old?.games) return old;
          return {
            ...old,
            games: old.games.map((game: Game) =>
              game.id === id ? { ...game, ...payload } : game
            ),
          };
        }
      );

      // Return context with previous data for rollback
      return { previousGames };
    },

    onSuccess: (_, variables) => {
      // Show toast for BOTH config updates AND toggle actions
      if (variables.payload.default_config) {
        showToast.success('Cập nhật cấu hình thành công');
      } else if (variables.payload.is_active !== undefined) {
        // Toggle toast with dynamic icon
        const isActive = variables.payload.is_active;
        const message = isActive ? 'Đã bật trò chơi' : 'Đã tắt trò chơi';
        showToast.success(message, 2000);
      }
      
      // Invalidate to sync with server (but optimistic update already shown)
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },

    onError: (error: any, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousGames) {
        context.previousGames.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      showToast.error(error.response?.data?.message || 'Không thể cập nhật trò chơi');
    },
  });
};
