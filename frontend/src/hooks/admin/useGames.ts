import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/admin/gameService';
import type { GameFilters, UpdateGamePayload, Game } from '@/services/admin/gameService';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { createElement } from 'react';

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
      // Only show toast for config updates, not toggle actions
      if (variables.payload.default_config) {
        toast.success('Cập nhật trò chơi thành công', {
          icon: createElement(CheckCircle, { className: "w-5 h-5 text-green-500" }),
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            fontFamily: 'monospace',
          },
          duration: 3000,
        });
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

      toast.error(error.response?.data?.message || 'Không thể cập nhật trò chơi', {
        icon: createElement(XCircle, { className: "w-5 h-5 text-red-500" }),
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--destructive) / 0.5)',
          fontFamily: 'monospace',
        },
        duration: 4000,
      });
    },
  });
};
