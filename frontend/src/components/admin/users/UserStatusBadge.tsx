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
      admin: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
      customer: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    },
    status: {
      active: 'bg-green-500/20 text-green-300 border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)] animate-pulse',
      banned: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    },
  };

  const variant = styles[type][status as keyof typeof styles[typeof type]] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';
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
