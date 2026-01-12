import { useMutation } from '@tanstack/react-query';
import { adminAuthService, AdminLoginRequest } from '@/services/admin/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAdminLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: AdminLoginRequest) => adminAuthService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`✅ Welcome back, ${data.user.name}!`);
      navigate('/admin');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(`❌ ${message}`);
    },
  });
};
