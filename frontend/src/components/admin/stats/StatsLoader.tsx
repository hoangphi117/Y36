import { cn } from '@/lib/utils';

export const StatsLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className={cn(
            "bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6",
            "animate-pulse"
          )}
        >
          <div className="w-14 h-14 bg-muted/50 rounded-xl mb-4" />
          <div className="h-10 w-24 bg-muted/50 rounded mb-2" />
          <div className="h-4 w-32 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  );
};
