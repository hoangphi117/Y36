import { MoreVertical, Ban, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '@/services/admin/userService';
import { UserStatusBadge } from './UserStatusBadge';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';

interface UserTableRowProps {
  user: User;
  index: number;
  onUpdateStatus: (userId: string, status: 'active' | 'banned') => void;
  onDelete: (userId: string) => void;
  isProcessing: boolean;
}

export const UserTableRow = ({ user, index, onUpdateStatus, onDelete, isProcessing }: UserTableRowProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'activate' | 'delete' } | null>(null);

  const handleAction = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'delete') {
      onDelete(user.id);
    } else {
      onUpdateStatus(user.id, confirmAction.type === 'ban' ? 'banned' : 'active');
    }
    setConfirmAction(null);
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={cn(
          'border-b border-border/30 transition-all duration-200 group',
          'hover:bg-primary/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'
        )}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center font-black text-lg text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              {user.username.charAt(0).toUpperCase()}
            </motion.div>
            <div>
              <p className="font-bold text-foreground font-mono">{user.username}</p>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                ID: {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </td>

        <td className="p-4 font-mono text-sm text-foreground/80">
          {user.email}
        </td>

        <td className="p-4">
          <UserStatusBadge status={user.role} type="role" />
        </td>

        <td className="p-4">
          <UserStatusBadge status={user.status} type="status" />
        </td>

        <td className="p-4 font-mono text-sm text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </td>

        <td className="p-4">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              )}
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400" />
            </motion.button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-52 bg-black/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 overflow-hidden"
              >
                {user.status === 'active' ? (
                  <button
                    onClick={() => setConfirmAction({ type: 'ban' })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm font-mono',
                      'text-red-400 hover:bg-red-500/20 hover:text-red-300',
                      'transition-all duration-150'
                    )}
                  >
                    <Ban className="w-4 h-4" />
                    Khóa tài khoản
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ type: 'activate' })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm font-mono',
                      'text-green-400 hover:bg-green-500/20 hover:text-green-300',
                      'transition-all duration-150'
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mở khóa tài khoản
                  </button>
                )}
                
                <button
                  onClick={() => setConfirmAction({ type: 'delete' })}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-mono',
                    'text-red-400 hover:bg-red-500/20 hover:text-red-300',
                    'border-t border-border/30 transition-all duration-150'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa vĩnh viễn
                </button>
              </motion.div>
            )}
          </div>
        </td>
      </motion.tr>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'delete' 
            ? 'Xóa người dùng?' 
            : confirmAction?.type === 'ban' 
            ? 'Khóa tài khoản?' 
            : 'Mở khóa tài khoản?'
        }
        message={
          confirmAction?.type === 'delete' 
            ? 'Hành động này không thể hoàn tác. Tất cả dữ liệu bao gồm lịch sử chơi game sẽ bị xóa vĩnh viễn.'
            : confirmAction?.type === 'ban'
            ? 'Người dùng này sẽ không thể đăng nhập vào hệ thống.'
            : 'Người dùng này sẽ có thể đăng nhập lại vào hệ thống.'
        }
        type={confirmAction?.type === 'activate' ? 'warning' : 'danger'}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isProcessing}
      />
    </>
  );
};
