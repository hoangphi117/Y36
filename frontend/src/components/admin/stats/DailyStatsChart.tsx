import { memo, useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/services/admin/statsService';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Clock } from 'lucide-react';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';

interface DailyStatsChartProps {
  data: DailyStats;
}

export const DailyStatsChart = memo(({ data }: DailyStatsChartProps) => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const allDates = new Set([
      ...Object.keys(data.newUsers || {}),
      ...Object.keys(data.newGameSessions || {}),
      ...Object.keys(data.totalPlayTime || {}),
    ]);

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
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
        playTime: Math.round((data.totalPlayTime[date] || 0) / 60),
      };
    });
  }, [data]);

  // Theme-aware colors
  const colors = useMemo(() => ({
    users: isDark ? '#06B6D4' : '#2DB5A3',
    sessions: isDark ? '#22C55E' : '#43A047',
    playTime: isDark ? '#EC4899' : '#E9714D',
    grid: isDark ? '#333' : '#D3CFC7',
    text: isDark ? '#F2F4F7' : '#1D2430',
  }), [isDark]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-surface p-4 shadow-lg"
      >
        <p className="admin-primary font-mono text-xs font-bold mb-2">
          {payload[0].payload.fullDate}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
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

  return (
    <div
      className="space-y-6"
      style={{ 
        transform: 'translateZ(0)',
      }}
    >
      {/* Chart 1: Người dùng mới */}
      <div 
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="admin-glass p-6 rounded-2xl hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 admin-primary animate-pulse" />
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

          <ResponsiveContainer width="100%" height={300} key="users-chart">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.users} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.users} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="newUsers"
                name="Người dùng mới"
                stroke={colors.users}
                strokeWidth={3}
                fill="url(#colorUsers)"
                dot={{ fill: colors.users, r: 4 }}
                activeDot={{ r: 6, fill: colors.users, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Phiên chơi mới */}
      <div 
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="admin-glass p-6 rounded-2xl hover:border-green-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-green-500 animate-pulse" />
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

          <ResponsiveContainer width="100%" height={300} key="sessions-chart">
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.sessions} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.sessions} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
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
      </div>

      {/* Chart 3: Thời gian chơi */}
      <div 
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="admin-glass p-6 rounded-2xl hover:border-accent/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Clock className="w-6 h-6 admin-accent animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground font-mono uppercase tracking-wider">
                Thời gian chơi
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Tổng thời gian chơi (phút) theo ngày
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300} key="playtime-chart">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke={colors.text}
                style={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="playTime"
                name="Phút chơi"
                stroke={colors.playTime}
                strokeWidth={3}
                dot={{ fill: colors.playTime, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: colors.playTime, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

DailyStatsChart.displayName = 'DailyStatsChart';
