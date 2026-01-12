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
      className="admin-glass p-4 rounded-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input - Chiếm 6 cột (50%) */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 admin-primary" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="admin-input pl-12 h-11"
          />
        </div>
        
        {/* Role Filter - Chiếm 3 cột (25%) */}
        <div className="md:col-span-3">
          <select
            value={filters.role || ''}
            onChange={(e) => onChange('role', e.target.value)}
            className="admin-input cursor-pointer h-11"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="customer">Người dùng</option>
          </select>
        </div>

        {/* Status Filter - Chiếm 3 cột (25%) */}
        <div className="md:col-span-3">
          <select
            value={filters.status || ''}
            onChange={(e) => onChange('status', e.target.value)}
            className="admin-input cursor-pointer h-11"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị khóa</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};
