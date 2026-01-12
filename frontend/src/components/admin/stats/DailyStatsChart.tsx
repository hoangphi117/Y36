import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { DailyStats } from '@/services/admin/statsService';

interface DailyStatsChartProps {
  data: DailyStats;
}

export const DailyStatsChart = ({ data }: DailyStatsChartProps) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    const dates = new Set([
      ...Object.keys(data.newUsers || {}),
      ...Object.keys(data.newGameSessions || {}),
      ...Object.keys(data.totalPlayTime || {})
    ]);

    return Array.from(dates).sort().map(date => ({
      date,
      newUsers: data.newUsers[date] || 0,
      newGameSessions: data.newGameSessions[date] || 0,
      playTimeHours: Math.round((data.totalPlayTime[date] || 0) / 3600 * 10) / 10
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-xl border border-border p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <p className="font-mono text-sm mb-2 border-b border-white/10 pb-1">
            {new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono my-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6">
       <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}
            stroke="#666"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="newUsers"
            name="New Users"
            stroke="#22d3ee" // Cyan
            strokeWidth={2}
            dot={{ r: 4, fill: '#22d3ee' }}
            activeDot={{ r: 6, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="newGameSessions"
            name="Sessions"
            stroke="#4ade80" // Green
            strokeWidth={2}
            dot={{ r: 4, fill: '#4ade80' }}
            activeDot={{ r: 6, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="playTimeHours"
            name="Play Time (h)"
            stroke="#e879f9" // Magenta
            strokeWidth={2}
            dot={{ r: 4, fill: '#e879f9' }}
            activeDot={{ r: 6, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
