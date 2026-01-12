import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/components/admin/stats/DashboardStats';
import { DailyStatsChart } from '@/components/admin/stats/DailyStatsChart';
import { DateRangePicker } from '@/components/admin/stats/DateRangePicker';
import { ExportButton } from '@/components/admin/stats/ExportButton';
import { useDailyStats } from '@/hooks/admin/useStats';

const StatsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: dailyStats, isLoading } = useDailyStats(dateRange.startDate, dateRange.endDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              STATISTICS <span className="text-primary">DASHBOARD</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-mono">
            Real-time analytics and platform insights
          </p>
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
          />
          <ExportButton 
            data={dailyStats} 
            filename={`stats-${dateRange.startDate}-to-${dateRange.endDate}`}
            disabled={!dailyStats}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <DashboardStats />

      {/* Daily Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          ACTIVITY TRENDS
        </h2>
        
        {isLoading ? (
          <div className="h-[400px] w-full bg-card/30 backdrop-blur-sm border border-border rounded-2xl animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground font-mono">Loading chart data...</div>
          </div>
        ) : dailyStats ? (
          <DailyStatsChart data={dailyStats} />
        ) : (
          <div className="h-[400px] w-full bg-card/30 backdrop-blur-sm border border-border rounded-2xl flex items-center justify-center">
            <div className="text-muted-foreground font-mono">No data available for selected range</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
