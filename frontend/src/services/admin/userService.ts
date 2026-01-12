import apiClient from '@/lib/admin/apiClient';

// ===== EXPORTS =====
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'customer';
  status: 'active' | 'banned';
  created_at: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
}

export interface UsersResponse {
  users: User[];
  paginate: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
  };
}

// ===== SERVICE IMPLEMENTATION =====
export const userService = {
  async getUsers(params: UserFilters): Promise<UsersResponse> {
    console.log('🌐 userService.getUsers called with params:', params); // ← DEBUG LOG

    // LỌC BỎ undefined, empty string, null
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('🧹 Cleaned params:', cleanParams);

    try {
      const { data } = await apiClient.get('/admin/users', { params: cleanParams });
      console.log('✅ API Success:', data); // ← DEBUG LOG
      return data;
    } catch (error) {
      console.error('❌ API Error:', error); // ← DEBUG LOG
      throw error;
    }
  },

  async updateStatus(userId: string, status: 'active' | 'banned'): Promise<User> {
    const { data } = await apiClient.put(`/admin/users/${userId}`, { status });
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
