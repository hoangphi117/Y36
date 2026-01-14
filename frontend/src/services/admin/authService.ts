import apiClient from '@/lib/admin/apiClient';

// Auth types definition
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
    status: string;
  };
}

export const adminAuthService = {
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    
    // Kiểm tra role phải là admin
    if (data.user.role !== 'admin') {
      throw new Error('Truy cập bị từ chối. Yêu cầu quyền quản trị viên.');
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    } catch {
      return false;
    }
  },
};
