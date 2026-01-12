import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/admin/userService';
import type { UserFilters } from '@/services/admin/userService';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Ban, Unlock } from 'lucide-react';
import { createElement } from 'react';

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
      
      const isBanned = variables.status === 'banned';
      const message = isBanned 
        ? 'Đã khóa tài khoản thành công' 
        : 'Đã mở khóa tài khoản thành công';
      const icon = isBanned 
        ? createElement(Ban, { className: "w-5 h-5 text-red-500" })
        : createElement(Unlock, { className: "w-5 h-5 text-green-500" });
      
      toast.success(message, {
        icon,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          fontFamily: 'monospace',
        },
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái', {
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã xóa người dùng thành công', {
        icon: createElement(CheckCircle, { className: "w-5 h-5 text-green-500" }),
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          fontFamily: 'monospace',
        },
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng', {
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
