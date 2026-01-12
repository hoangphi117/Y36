import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/admin/userService';
import type { UserFilters } from '@/services/admin/userService';
import toast from 'react-hot-toast';

export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => userService.getUsers(filters),
    retry: 1,
    staleTime: 0,
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
          ? '✅ Đã khóa tài khoản thành công' 
          : '✅ Đã mở khóa tài khoản thành công'
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Không thể cập nhật trạng thái');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('✅ Đã xóa người dùng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Không thể xóa người dùng');
    },
  });
};
