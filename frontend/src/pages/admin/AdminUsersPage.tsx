import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '@/hooks/admin/useUsers';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';
import { Pagination } from '@/components/admin/users/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import type { UserFilters as UserFiltersType } from '@/services/admin/userService';

export const AdminUsersPage = () => {
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
    sort: '-created_at'
  });

  const debouncedSearch = useDebounce(filters.search || '', 500);
  
  // Chỉ truyền search nếu có giá trị
  const queryFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error, isError } = useUsers(queryFilters);
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Error state
  if (isError) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-destructive mb-2">Error Loading Users</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-primary font-mono mb-2">
            USER_MANAGEMENT
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Quản lý tài khoản người dùng và phân quyền
          </p>
        </div>

        <UserFilters filters={filters} onChange={handleFilterChange} />

        {/* Debug info */}
        <div className="bg-muted/50 p-4 rounded-lg text-xs font-mono">
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Users: {data?.users?.length || 0}</p>
          <p>Total: {data?.paginate?.totalUsers || 0}</p>
        </div>

        <UserTable
          users={data?.users || []}
          isLoading={isLoading}
          onUpdateStatus={(id, status) => updateStatusMutation.mutate({ userId: id, status })}
          onDelete={(id) => deleteMutation.mutate(id)}
          isProcessing={updateStatusMutation.isPending || deleteMutation.isPending}
        />

        {data?.paginate && (
          <Pagination
            page={data.paginate.page}
            totalPages={data.paginate.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};
