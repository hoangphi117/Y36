import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '@/hooks/admin/useUsers';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';
import { Pagination } from '@/components/admin/users/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import type { UserFilters as UserFiltersType } from '@/services/admin/userService';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export const AdminUsersPage = () => {
  useDocumentTitle("Quản lý người dùng");
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    limit: 8,
    search: '',
    role: '',
    status: '',
    sort: '-created_at'
  });

  const debouncedSearch = useDebounce(filters.search || '', 500);
  
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
        <Toaster 
          position="top-center"
          containerStyle={{
            top: 20,
            zIndex: 9999,
          }}
          toastOptions={{
            style: {
              background: 'transparent',
              boxShadow: 'none',
            },
          }}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-black text-red-400 mb-2 font-mono">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-sm text-muted-foreground font-mono mb-4">
              {error instanceof Error ? error.message : 'Không thể tải danh sách người dùng'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary/20 border border-primary/40 text-primary rounded-lg font-mono text-sm hover:bg-primary/30 transition-all"
            >
              Thử lại
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <UsersIcon className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground font-mono uppercase tracking-wider">
              Quản lý người dùng
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Quản lý tài khoản và phân quyền người dùng
            </p>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="admin-glass p-4 rounded-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Tổng người dùng
            </p>
            <p className="text-2xl font-black admin-primary font-mono">
              {data?.paginate?.totalUsers || 0}
            </p>
          </div>
          <div className="admin-glass p-4 rounded-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Đang hiển thị
            </p>
            <p className="text-2xl font-black admin-accent font-mono">
              {data?.users?.length || 0}
            </p>
          </div>
          <div className="admin-glass p-4 rounded-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Trang hiện tại
            </p>
            <p className="text-2xl font-black text-green-500 font-mono">
              {data?.paginate?.page || 1}/{data?.paginate?.totalPages || 1}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <UserFilters filters={filters} onChange={handleFilterChange} />

        {/* Table */}
        <UserTable
          users={data?.users || []}
          isLoading={isLoading}
          onUpdateStatus={(id, status) => updateStatusMutation.mutate({ userId: id, status })}
          onDelete={(id) => deleteMutation.mutate(id)}
          isProcessing={updateStatusMutation.isPending || deleteMutation.isPending}
        />

        {/* Pagination */}
        {data?.paginate && data.paginate.totalPages > 1 && (
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
