import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-primary" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={filters.search || ''}
          onChange={(e) => onChange('search', e.target.value)}
          className="admin-input pl-10"
        />
      </div>
      
      {/* Role Filter */}
      <select
        value={filters.role || ''}
        onChange={(e) => onChange('role', e.target.value)}
        className="admin-input cursor-pointer"
      >
        <option value="">Tất cả vai trò</option>
        <option value="admin">Quản trị viên</option>
        <option value="customer">Người dùng</option>
      </select>

      {/* Status Filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange('status', e.target.value)}
        className="admin-input cursor-pointer"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="banned">Bị khóa</option>
      </select>
    </motion.div>
  );
};
