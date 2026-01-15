import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/admin/statsService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: statsService.getDashboard,
  });
};

export const useDailyStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['admin-daily-stats', startDate, endDate],
    queryFn: () => statsService.getDailyStats(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};
