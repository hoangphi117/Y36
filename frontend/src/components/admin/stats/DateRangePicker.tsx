import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  className?: string;
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export const DateRangePicker = ({ startDate, endDate, onRangeChange, className }: DateRangePickerProps) => {
  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    onRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <div className="flex gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.days}
            onClick={() => handlePreset(preset.days)}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg 
                     bg-secondary/50 text-secondary-foreground hover:bg-secondary
                     border border-secondary-foreground/20 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card/50 border border-border rounded-lg p-1.5">
        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-4 h-4 text-primary" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onRangeChange(e.target.value, endDate)}
            className="bg-transparent border-none text-sm font-mono focus:ring-0 p-0 text-foreground w-[130px]"
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex items-center gap-2 px-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onRangeChange(startDate, e.target.value)}
            className="bg-transparent border-none text-sm font-mono focus:ring-0 p-0 text-foreground w-[130px]"
          />
        </div>
      </div>
    </div>
  );
};
