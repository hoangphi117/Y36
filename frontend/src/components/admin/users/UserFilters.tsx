import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserFiltersProps {
  filters: any;
  onChange: (key: string, value: any) => void;
}

export const UserFilters = ({ filters, onChange }: UserFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row gap-4 mb-6"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={filters.search || ''}
          onChange={(e) => onChange('search', e.target.value)}
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-lg font-mono text-sm',
            'bg-black/40 backdrop-blur-sm border border-border/50',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
            'transition-all duration-200'
          )}
        />
      </div>
      
      {/* Role Filter */}
      <select
        value={filters.role || ''}
        onChange={(e) => onChange('role', e.target.value)}
        className={cn(
          'px-4 py-2.5 rounded-lg font-mono text-sm',
          'bg-black/40 backdrop-blur-sm border border-border/50',
          'text-foreground',
          'focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          'transition-all duration-200',
          'cursor-pointer'
        )}
      >
        <option value="">Tất cả vai trò</option>
        <option value="admin">Quản trị viên</option>
        <option value="customer">Người dùng</option>
      </select>

      {/* Status Filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange('status', e.target.value)}
        className={cn(
          'px-4 py-2.5 rounded-lg font-mono text-sm',
          'bg-black/40 backdrop-blur-sm border border-border/50',
          'text-foreground',
          'focus:outline-none focus:border-green-500/60 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          'transition-all duration-200',
          'cursor-pointer'
        )}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="banned">Bị khóa</option>
      </select>
    </motion.div>
  );
};
