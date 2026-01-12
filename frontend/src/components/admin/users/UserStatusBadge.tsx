import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'role' | 'status';
}

export const UserStatusBadge = ({ status, type }: StatusBadgeProps) => {
  const styles = {
    role: {
      admin: 'bg-primary/20 text-primary border-primary/30',
      customer: 'bg-muted text-muted-foreground border-border',
    },
    status: {
      active: 'bg-green-500/20 text-green-500 border-green-500/30',
      banned: 'bg-destructive/20 text-destructive border-destructive/30',
    },
  };

  const variant = styles[type][status as keyof typeof styles[type]] || 'bg-gray-500/20 text-gray-500';

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide', variant)}>
      {status}
    </span>
  );
};
