import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/admin/gameService';
import type { GameFilters, UpdateGamePayload, Game } from '@/services/admin/gameService';
import { showToast } from '@/components/admin/ui/Toast';

export const useGames = (filters: GameFilters = {}) => {
  return useQuery({
    queryKey: ['admin-games', JSON.stringify(filters)],
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
      // Cancel all admin-games queries (bất kể filters)
      await queryClient.cancelQueries({ queryKey: ['admin-games'] });

      // Snapshot previous values
      const previousGames = queryClient.getQueriesData({ queryKey: ['admin-games'] });

      // Update ALL matching queries
      queryClient.setQueriesData(
        { queryKey: ['admin-games'] }, // Prefix matching
        (old: any) => {
          if (!old?.games) return old;
          
          const updated = {
            ...old,
            games: old.games.map((game: Game) =>
              game.id === id ? { ...game, ...payload } : game
            ),
          };
          return updated;
        }
      );

      return { previousGames };
    },

    onSuccess: (_, variables) => {
      // Show toast for BOTH config updates AND toggle actions
      if (variables.payload.default_config) {
        showToast.success('Cập nhật cấu hình thành công');
        // Config update: Invalidate ALL queries
        queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      } else if (variables.payload.is_active !== undefined) {
        // Toggle toast with dynamic message
        const isActive = variables.payload.is_active;
        const message = isActive ? 'Đã bật trò chơi' : 'Đã tắt trò chơi';
        showToast.success(message, 2000);
        
        // ✅ DO NOT invalidate admin-games → Keep stable layout
        // ✅ BUT invalidate dashboard stats to update counters
      }
      
      // ALWAYS invalidate dashboard stats (updates counters)
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
