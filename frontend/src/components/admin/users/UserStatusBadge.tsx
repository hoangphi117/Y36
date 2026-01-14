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
      ),
      customer: cn(
        'bg-accent/20 border-accent/40',
        'text-accent',
      ),
    },
    status: {
      active: cn(
        'bg-green-600/20 border-green-600/40 animate-pulse',
        'text-green-500',
      ),
      banned: cn(
        'bg-destructive/20 border-destructive/40',
        'text-destructive',
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
