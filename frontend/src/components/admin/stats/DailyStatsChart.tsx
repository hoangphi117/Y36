import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/services/admin/statsService';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Clock } from 'lucide-react';

interface DailyStatsChartProps {
  data: DailyStats;
}

export const DailyStatsChart = ({ data }: DailyStatsChartProps) => {
  // Prepare chart data
  const allDates = new Set([
    ...Object.keys(data.newUsers || {}),
    ...Object.keys(data.newGameSessions || {}),
    ...Object.keys(data.totalPlayTime || {}),
  ]);

  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map((date) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      fullDate: dateObj.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      newUsers: data.newUsers[date] || 0,
      newSessions: data.newGameSessions[date] || 0,
      playTime: Math.round((data.totalPlayTime[date] || 0) / 3600), // Convert to hours
    };
  });

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/95 backdrop-blur-xl border border-cyan-500/50 rounded-lg p-4 shadow-[0_0_30px_rgba(0,255,255,0.4)]"
      >
        <p className="text-cyan-300 font-mono text-xs font-bold mb-2">
          {payload[0].payload.fullDate}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 8px ${entry.color}`
              }}
            />
            <span className="text-muted-foreground font-mono text-xs">
              {entry.name}:
            </span>
            <span className="text-foreground font-mono text-xs font-bold">
              {entry.value.toLocaleString('vi-VN')}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground font-mono">
        Không có dữ liệu cho khoảng thời gian đã chọn
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Chart 1: Người dùng mới */}
      <motion.div variants={itemVariants}>
        <div className="bg-card/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground font-mono uppercase tracking-wider">
                Người dùng mới
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Số lượng người dùng đăng ký mới theo ngày
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#00FFFF" 
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#06B6D4' }}
              />
              <YAxis 
                stroke="#00FFFF"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#06B6D4' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="newUsers"
                name="Người dùng mới"
                stroke="#06B6D4"
                strokeWidth={3}
                fill="url(#colorUsers)"
                dot={{ fill: '#06B6D4', r: 4, strokeWidth: 2, stroke: '#000' }}
                activeDot={{ 
                  r: 6, 
                  fill: '#06B6D4',
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 2: Phiên chơi mới */}
      <motion.div variants={itemVariants}>
        <div className="bg-card/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Gamepad2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground font-mono uppercase tracking-wider">
                Phiên chơi mới
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Số lượng phiên chơi được tạo theo ngày
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#00FF00"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#22C55E' }}
              />
              <YAxis 
                stroke="#00FF00"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#22C55E' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="newSessions"
                name="Phiên chơi mới"
                fill="url(#colorSessions)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Chart 3: Thời gian chơi */}
      <motion.div variants={itemVariants}>
        <div className="bg-card/50 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <Clock className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground font-mono uppercase tracking-wider">
                Thời gian chơi
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Tổng thời gian chơi (giờ) theo ngày
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorPlayTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#FF00FF"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#EC4899' }}
              />
              <YAxis 
                stroke="#FF00FF"
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
                tick={{ fill: '#EC4899' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="playTime"
                name="Giờ chơi"
                stroke="#EC4899"
                strokeWidth={3}
                dot={{ 
                  fill: '#EC4899', 
                  r: 5,
                  strokeWidth: 2,
                  stroke: '#000'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#EC4899',
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};
