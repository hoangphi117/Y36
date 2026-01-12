import { motion } from 'framer-motion';
import type { User } from '@/services/admin/userService';
import { UserTableRow } from './UserTableRow';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onUpdateStatus: (userId: string, status: 'active' | 'banned') => void;
  onDelete: (userId: string) => void;
  isProcessing: boolean;
}

export const UserTable = ({ users, isLoading, onUpdateStatus, onDelete, isProcessing }: UserTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-20 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 animate-pulse"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/50 rounded w-1/4" />
                <div className="h-3 bg-muted/30 rounded w-1/3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <span className="text-4xl">👥</span>
        </div>
        <h3 className="text-xl font-black text-foreground mb-2 font-mono">
          Không tìm thấy người dùng
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn
        </p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-card/50 border-b border-border/50">
              <th className="text-left p-4 font-mono text-sm text-cyan-400 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="text-left p-4 font-mono text-sm text-cyan-400 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left p-4 font-mono text-sm text-cyan-400 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="text-left p-4 font-mono text-sm text-cyan-400 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left p-4 font-mono text-sm text-cyan-400 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={index}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
                isProcessing={isProcessing}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
