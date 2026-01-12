import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/admin/gameService';
import type { GameFilters, UpdateGamePayload } from '@/services/admin/gameService';
import toast from 'react-hot-toast';

export const useGames = (filters: GameFilters = {}) => {
  return useQuery({
    queryKey: ['admin-games', filters],
    queryFn: () => gameService.getGames(filters),
    retry: 1,
    staleTime: 0,
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGamePayload }) =>
      gameService.updateGame(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast.success('✅ Cập nhật trò chơi thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Không thể cập nhật trò chơi');
    },
  });
};
