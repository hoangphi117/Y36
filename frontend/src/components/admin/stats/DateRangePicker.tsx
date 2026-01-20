import { useState, memo } from 'react';
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

export const DateRangePicker = memo(({ startDate, endDate, onRangeChange, className }: DateRangePickerProps) => {
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePreset = (days: number, index: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setActivePreset(index);
    onRangeChange(formatDate(start), formatDate(end));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    onRangeChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    onRangeChange(startDate, e.target.value);
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
              "border cursor-pointer",
              activePreset === index
                ? "bg-primary/20 border-primary text-primary font-bold"
                : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider font-bold">
            Ngày bắt đầu
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate}
              className="admin-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider font-bold">
            Ngày kết thúc
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="admin-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';
