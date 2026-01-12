import { Users, Gamepad2, Swords, Clock } from 'lucide-react';
import { useDashboardStats } from '@/hooks/admin/useStats';
import { StatCard } from './StatCard';
import { StatsLoader } from './StatsLoader';
import { formatPlayTime } from '@/lib/admin/statsUtils';

export const DashboardStats = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <StatsLoader />;
  
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        Failed to load dashboard statistics
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Users}
        label="Total Users"
        value={stats.totalUsers}
        color="cyan"
      />
      <StatCard
        icon={Gamepad2}
        label="Active Games"
        value={stats.activeGames}
        color="green"
      />
      <StatCard
        icon={Swords}
        label="Total Matches"
        value={stats.totalMatches}
        color="purple"
      />
      <StatCard
        icon={Clock}
        label="Total Play Time"
        value={stats.totalPlayTime}
        color="magenta"
        formatter={formatPlayTime}
      />
    </div>
  );
};
