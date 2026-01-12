import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'role' | 'status';
}

const LABELS = {
  role: {
    admin: 'Quản trị viên',
    customer: 'Người dùng',
  },
  status: {
    active: 'Hoạt động',
    banned: 'Bị khóa',
  },
};

export const UserStatusBadge = ({ status, type }: StatusBadgeProps) => {
  const styles = {
    role: {
      admin: cn(
        'bg-primary/20 border-primary/40',
        'text-primary',
        'dark:text-primary'
      ),
      customer: cn(
        'bg-accent/20 border-accent/40',
        'text-accent',
        'dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
      ),
    },
    status: {
      active: cn(
        'bg-green-500/20 border-green-500/40 animate-pulse',
        'text-green-700',
        'dark:text-green-300'
      ),
      banned: cn(
        'bg-red-500/20 border-red-500/40',
        'text-red-700',
        'dark:text-red-300'
      ),
    },
  };

  const variant = styles[type][status as keyof typeof styles[typeof type]] || 
    'bg-muted/50 text-muted-foreground border-border';
  const label = LABELS[type][status as keyof typeof LABELS[typeof type]] || status;

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide font-mono',
      'transition-all duration-200',
      variant
    )}>
      {label}
    </span>
  );
};
