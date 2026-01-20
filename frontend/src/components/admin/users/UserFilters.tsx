import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminInput } from '@/components/admin/ui/AdminInput';
import { AdminSelect } from '@/components/admin/ui/AdminSelect';

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
        <div className="md:col-span-6">
          <AdminInput
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            icon={<Search className="w-5 h-5 text-foreground opacity-60" strokeWidth={2.5} />}
            className="h-11"
          />
        </div>
        
        {/* Role Filter - Chiếm 3 cột (25%) */}
        <div className="md:col-span-3">
          <AdminSelect
            value={filters.role || ''}
            onChange={(e) => onChange('role', e.target.value)}
            className="h-11"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="customer">Người dùng</option>
          </AdminSelect>
        </div>

        {/* Status Filter - Chiếm 3 cột (25%) */}
        <div className="md:col-span-3">
          <AdminSelect
            value={filters.status || ''}
            onChange={(e) => onChange('status', e.target.value)}
            className="h-11"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị khóa</option>
          </AdminSelect>
        </div>
      </div>
    </motion.div>
  );
};
