import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/admin/userService';
import type { UserFilters } from '@/services/admin/userService';
import toast from 'react-hot-toast';

export const useUsers = (filters: UserFilters) => {
  console.log('🔍 useUsers called with filters:', filters); // ← DEBUG LOG

  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      console.log('📡 Calling API with filters:', filters); // ← DEBUG LOG
      const result = await userService.getUsers(filters);
      console.log('✅ API Response:', result); // ← DEBUG LOG
      return result;
    },
    retry: 1,
    staleTime: 0, // ← Force refetch
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'banned' }) =>
      userService.updateStatus(userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(
        variables.status === 'banned' 
          ? '✅ User banned successfully' 
          : '✅ User activated successfully'
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Failed to update user status');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('✅ User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Failed to delete user');
    },
  });
};
