import apiClient from '@/lib/admin/apiClient';

export interface DashboardStats {
  totalUsers: number;
  activeGames: number;
  totalMatches: number;
  totalPlayTime: number;
}

export interface DailyStats {
  newUsers: Record<string, number>;
  newGameSessions: Record<string, number>;
  totalPlayTime: Record<string, number>;
}

export const statsService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/admin/stats/dashboard');
    return data;
  },

  getDailyStats: async (startDate: string, endDate: string): Promise<DailyStats> => {
    const { data } = await apiClient.post('/admin/stats/daily', {
      startDate,
      endDate,
    });
    return data;
  },
};
