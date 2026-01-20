import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminInput } from '@/components/admin/ui/AdminInput';
import { AdminSelect } from '@/components/admin/ui/AdminSelect';

interface GameFiltersProps {
  filters: any;
  onChange: (key: string, value: any) => void;
}

export const GameFilters = ({ filters, onChange }: GameFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    onChange('search', debouncedSearch);
  }, [debouncedSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-glass p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <AdminInput
          type="text"
          placeholder="Tìm theo tên, mã game..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          icon={<Search className="w-4 h-4 text-foreground opacity-60" strokeWidth={2.5} />}
        />

        {/* Active Status Filter */}
        <AdminSelect
          value={filters.is_active ?? ''}
          onChange={(e) => onChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Tạm dừng</option>
        </AdminSelect>

        {/* Sort */}
        <AdminSelect
          value={filters.sort || '-created_at'}
          onChange={(e) => onChange('sort', e.target.value)}
        >
          <option value="-created_at">Mới nhất</option>
          <option value="created_at">Cũ nhất</option>
          <option value="name">Tên (A-Z)</option>
          <option value="-name">Tên (Z-A)</option>
          <option value="-id">ID (Cao → Thấp)</option>
          <option value="id">ID (Thấp → Cao)</option>
        </AdminSelect>

        {/* Clear Filters */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSearchInput('');
            onChange('search', '');
            onChange('is_active', undefined);
            onChange('sort', '-created_at');
          }}
          className="admin-btn-secondary bg-destructive/40 text-destructive hover:bg-destructive/60 cursor-pointer"
        >
          Xóa bộ lọc
        </motion.button>
      </div>
    </motion.div>
  );
};
