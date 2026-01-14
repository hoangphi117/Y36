import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-primary" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã game..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input pl-10"
          />
        </div>

        {/* Active Status Filter */}
        <select
          value={filters.is_active ?? ''}
          onChange={(e) => onChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="admin-input cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Tạm dừng</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sort || '-created_at'}
          onChange={(e) => onChange('sort', e.target.value)}
          className="admin-input cursor-pointer"
        >
          <option value="-created_at">Mới nhất</option>
          <option value="created_at">Cũ nhất</option>
          <option value="name">Tên (A-Z)</option>
          <option value="-name">Tên (Z-A)</option>
          <option value="-id">ID (Cao → Thấp)</option>
          <option value="id">ID (Thấp → Cao)</option>
        </select>

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
          className="admin-btn-secondary"
        >
          Xóa bộ lọc
        </motion.button>
      </div>
    </motion.div>
  );
};
