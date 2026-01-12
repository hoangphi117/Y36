import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<LucideProps>;
  label: string;
  value: number | string;
  color: 'cyan' | 'purple' | 'magenta' | 'green';
  className?: string;
  formatter?: (val: number) => string;
}

export const StatCard = ({ icon: Icon, label, value, color, className, formatter }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      let current = 0;
      const increment = value / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [value]);

  const colorClasses = {
    cyan: 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    purple: 'bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    magenta: 'bg-pink-500/20 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    green: 'bg-green-500/20 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  };

  const borderColors = {
    cyan: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]',
    purple: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    magenta: 'group-hover:border-pink-500/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]',
    green: 'group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]',
  };

  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          'bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6',
          'transition-all duration-300 cursor-pointer',
          borderColors[color]
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
            'transition-transform group-hover:scale-110',
            colorClasses[color]
          )}
        >
          <Icon className="w-7 h-7" />
        </div>

        {/* Value */}
        <h3 className="text-4xl font-black text-foreground mb-2 font-mono">
          {typeof value === 'number' 
            ? (formatter ? formatter(displayValue) : displayValue.toLocaleString()) 
            : value}
        </h3>

        {/* Label */}
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
};
