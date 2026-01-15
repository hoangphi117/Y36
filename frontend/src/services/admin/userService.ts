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
    // Lọc bỏ undefined, empty string, null
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const { data } = await apiClient.get('/admin/users', { params: cleanParams });
    return data;
  },

  async updateStatus(userId: string, status: 'active' | 'banned'): Promise<User> {
    const { data } = await apiClient.put(`/admin/users/${userId}`, { status });
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
