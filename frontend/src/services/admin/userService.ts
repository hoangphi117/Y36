import { api } from '@/lib/api';

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

export const userService = {
  getUsers: async (params: UserFilters): Promise<UsersResponse> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateStatus: async (userId: string, status: 'active' | 'banned') => {
    const { data } = await api.put(`/admin/users/${userId}`, { status });
    return data;
  },

  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },
};
