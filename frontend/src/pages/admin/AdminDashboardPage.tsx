import { useDashboardStats } from '@/hooks/admin/useStats';
import { StatCard } from '@/components/admin/stats/StatCard';
import { Users, Gamepad2, Trophy, Clock, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPlayTime } from '@/lib/admin/statsUtils';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export const AdminDashboardPage = () => {
  const { data, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();
  useDocumentTitle("Dashboard");

  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono text-sm">Đang tải dữ liệu...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-black text-red-400 mb-2 font-mono">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-sm text-muted-foreground font-mono mb-4">
            {error instanceof Error ? error.message : 'Không thể tải thống kê dashboard'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary/20 border border-primary/40 text-primary rounded-lg font-mono text-sm hover:bg-primary/30 transition-all"
          >
            Thử lại
          </button>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-500/30">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground font-mono uppercase tracking-wider">
              {greeting}, Admin!
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Tổng quan hệ thống ngày {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
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
            value={data?.totalPlayTime || 0}
            color="green"
            formatter={formatPlayTime}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-foreground font-mono uppercase tracking-wider">
              Truy cập nhanh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/users')}
              className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500/20 hover:to-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer group text-left shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              <Users className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform animate-pulse" />
              <p className="font-bold text-foreground text-lg mb-1">Quản lý người dùng</p>
              <p className="text-xs text-muted-foreground font-mono">
                Xem, chỉnh sửa, xóa tài khoản
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/games')}
              className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer group text-left shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <Gamepad2 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform animate-pulse" />
              <p className="font-bold text-foreground text-lg mb-1">Quản lý trò chơi</p>
              <p className="text-xs text-muted-foreground font-mono">
                Cấu hình, bật/tắt trò chơi
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/stats')}
              className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border border-green-500/30 hover:border-green-500/50 rounded-xl transition-all cursor-pointer group text-left shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
              <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform animate-pulse" />
              <p className="font-bold text-foreground text-lg mb-1">Thống kê chi tiết</p>
              <p className="text-xs text-muted-foreground font-mono">
                Xem biểu đồ và báo cáo
              </p>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
