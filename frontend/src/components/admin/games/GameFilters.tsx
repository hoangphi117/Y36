import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

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
    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã game..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
          />
        </div>

        {/* Active Status Filter */}
        <select
          value={filters.is_active ?? ''}
          onChange={(e) => onChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Tạm dừng</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sort || '-created_at'}
          onChange={(e) => onChange('sort', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
        >
          <option value="-created_at">Mới nhất</option>
          <option value="created_at">Cũ nhất</option>
          <option value="name">Tên (A-Z)</option>
          <option value="-name">Tên (Z-A)</option>
          <option value="-id">ID (Cao → Thấp)</option>
          <option value="id">ID (Thấp → Cao)</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchInput('');
            onChange('search', '');
            onChange('is_active', undefined);
            onChange('sort', '-created_at');
          }}
          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl font-mono text-sm transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};
