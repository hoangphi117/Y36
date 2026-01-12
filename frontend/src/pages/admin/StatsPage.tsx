import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { DashboardStats } from '@/components/admin/stats/DashboardStats';
import { DailyStatsChart } from '@/components/admin/stats/DailyStatsChart';
import { DateRangePicker } from '@/components/admin/stats/DateRangePicker';
import { ExportButton } from '@/components/admin/stats/ExportButton';
import { useDailyStats } from '@/hooks/admin/useStats';
import { exportToCSV, exportToJSON } from '@/lib/admin/statsUtils';

const StatsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: dailyStats, isLoading, error } = useDailyStats(dateRange.startDate, dateRange.endDate);

  const handleExportCSV = () => {
    if (!dailyStats) return;

    const allDates = new Set([
      ...Object.keys(dailyStats.newUsers || {}),
      ...Object.keys(dailyStats.newGameSessions || {}),
      ...Object.keys(dailyStats.totalPlayTime || {}),
    ]);

    const csvData = Array.from(allDates)
      .sort()
      .map((date) => ({
        'Ngày': new Date(date).toLocaleDateString('vi-VN'),
        'Người dùng mới': dailyStats.newUsers[date] || 0,
        'Phiên chơi mới': dailyStats.newGameSessions[date] || 0,
        'Thời gian chơi (giây)': dailyStats.totalPlayTime[date] || 0,
      }));

    exportToCSV(csvData, `thong-ke-${dateRange.startDate}-den-${dateRange.endDate}`);
  };

  const handleExportJSON = () => {
    if (!dailyStats) return;
    exportToJSON(dailyStats, `thong-ke-${dateRange.startDate}-den-${dateRange.endDate}`);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      />
      
      <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <TrendingUp className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground font-mono uppercase tracking-wider">
            Thống kê hệ thống
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Phân tích và số liệu hoạt động nền tảng
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <DashboardStats />

      {/* Date Range & Export */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
        <div className="flex-1">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
          />
        </div>
        <ExportButton 
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          disabled={!dailyStats}
        />
      </div>

      {/* Daily Chart */}
      {isLoading && (
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">Đang tải dữ liệu biểu đồ...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-400 font-mono text-sm">
            Không thể tải thống kê. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {dailyStats && !isLoading && <DailyStatsChart data={dailyStats} />}
      </div>
    </>
  );
};

export default StatsPage;
