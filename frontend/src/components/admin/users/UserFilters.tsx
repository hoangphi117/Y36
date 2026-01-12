import { Search } from 'lucide-react';

interface UserFiltersProps {
  filters: any;
  onChange: (key: string, value: any) => void;
}

export const UserFilters = ({ filters, onChange }: UserFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={filters.search || ''}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      
      <select
        value={filters.role || ''}
        onChange={(e) => onChange('role', e.target.value)}
        className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="customer">Customer</option>
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) => onChange('status', e.target.value)}
        className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="banned">Banned</option>
      </select>
    </div>
  );
};
