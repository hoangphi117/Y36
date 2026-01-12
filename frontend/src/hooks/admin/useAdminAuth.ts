import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '@/services/admin/authService';
import type { AdminLoginRequest } from '@/services/admin/authService';
import { showToast } from '@/components/admin/ui/Toast';

export const useAdminLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: AdminLoginRequest) => adminAuthService.login(credentials),
    
    onSuccess: (data) => {
      // Lưu token và user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Success toast
      showToast.success(`Chào mừng trở lại, ${data.user.name}!`, 2000);

      // Redirect sau 500ms để user thấy toast
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    },

    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      
      // Check if access denied (not admin)
      const isAccessDenied = errorMessage.includes('Access denied') || 
                             errorMessage.includes('Admin privileges') ||
                             errorMessage.includes('Truy cập bị từ chối') ||
                             errorMessage.includes('quản trị viên');
      
      if (isAccessDenied) {
        showToast.warning(errorMessage, 4000);
      } else {
        showToast.error(errorMessage, 4000);
      }
    },
  });
};
