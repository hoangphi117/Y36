import { useDashboardStats } from '@/hooks/admin/useStats';
import { StatCard } from '@/components/admin/stats/StatCard';
import { Users, Gamepad2, Trophy, Clock } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md">
          <h3 className="text-lg font-bold text-destructive mb-2">Error Loading Stats</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
          </p>
        </div>
      </div>
    );
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary font-mono mb-2">
            DASHBOARD_OVERVIEW
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Tổng quan thống kê hệ thống
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={data?.totalUsers || 0}
          color="cyan"
        />
        <StatCard
          icon={Gamepad2}
          label="Trò chơi hoạt động"
          value={data?.activeGames || 0}
          color="purple"
        />
        <StatCard
          icon={Trophy}
          label="Tổng trận đấu"
          value={data?.totalMatches || 0}
          color="magenta"
        />
        <StatCard
          icon={Clock}
          label="Tổng thời gian chơi"
          value={data?.totalPlayTime ? formatPlayTime(data.totalPlayTime) : '0h 0m'}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card/30 backdrop-blur-xl border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 font-mono">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all cursor-pointer group"
          >
            <Users className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-foreground">Quản lý người dùng</p>
            <p className="text-xs text-muted-foreground mt-1">
              Xem, chỉnh sửa, xóa người dùng
            </p>
          </a>

          <a
            href="/admin/games"
            className="p-4 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl transition-all cursor-pointer group"
          >
            <Gamepad2 className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-foreground">Quản lý trò chơi</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cấu hình, bật/tắt trò chơi
            </p>
          </a>

          <a
            href="/admin/stats"
            className="p-4 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-xl transition-all cursor-pointer group"
          >
            <BarChart3 className="w-6 h-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-foreground">Thống kê chi tiết</p>
            <p className="text-xs text-muted-foreground mt-1">
              Xem biểu đồ và báo cáo
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};
