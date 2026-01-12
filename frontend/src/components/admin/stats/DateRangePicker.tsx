import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  className?: string;
}

const PRESETS = [
  { label: '7 ngày qua', days: 7 },
  { label: '30 ngày qua', days: 30 },
  { label: '90 ngày qua', days: 90 },
];

export const DateRangePicker = ({ startDate, endDate, onRangeChange, className }: DateRangePickerProps) => {
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const handlePreset = (days: number, index: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setActivePreset(index);
    onRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  const handleCustomChange = (type: 'start' | 'end', value: string) => {
    setActivePreset(null);
    if (type === 'start') {
      onRangeChange(value, endDate);
    } else {
      onRangeChange(startDate, value);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset, index) => (
          <button
            key={preset.days}
            onClick={() => handlePreset(preset.days, index)}
            className={cn(
              "px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200",
              "border backdrop-blur-sm",
              activePreset === index
                ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-black/30 border-border/50 text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-400"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Ngày bắt đầu
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomChange('start', e.target.value)}
              max={endDate}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg font-mono text-sm',
                'bg-black/40 backdrop-blur-sm border border-border/50',
                'text-foreground',
                'focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Ngày kết thúc
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomChange('end', e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg font-mono text-sm',
                'bg-black/40 backdrop-blur-sm border border-border/50',
                'text-foreground',
                'focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
