import { MoreVertical, Shield, Ban, Trash2, CheckCircle } from 'lucide-react';
import type { User } from '@/services/admin/userService';
import { UserStatusBadge } from './UserStatusBadge';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface UserTableRowProps {
  user: User;
  onUpdateStatus: (userId: string, status: 'active' | 'banned') => void;
  onDelete: (userId: string) => void;
  isProcessing: boolean;
}

export const UserTableRow = ({ user, onUpdateStatus, onDelete, isProcessing }: UserTableRowProps) => {
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
      <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-foreground">{user.username}</p>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{user.id}</p>
            </div>
          </div>
        </td>
        <td className="p-4 font-mono text-sm">{user.email}</td>
        <td className="p-4">
          <UserStatusBadge status={user.role} type="role" />
        </td>
        <td className="p-4">
          <UserStatusBadge status={user.status} type="status" />
        </td>
        <td className="p-4 font-mono text-sm text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="p-4">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {user.status === 'active' ? (
                  <button
                    onClick={() => setConfirmAction({ type: 'ban' })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Ban User
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ type: 'activate' })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-green-500 hover:bg-green-500/10 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Activate User
                  </button>
                )}
                
                <button
                  onClick={() => setConfirmAction({ type: 'delete' })}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 border-t border-border/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Permanently
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete User?' : confirmAction?.type === 'ban' ? 'Ban User?' : 'Activate User?'}
        message={
          confirmAction?.type === 'delete' 
            ? 'This action cannot be undone. All user data including game history will be permanently deleted.'
            : `Are you sure you want to ${confirmAction?.type} this user?`
        }
        type={confirmAction?.type === 'activate' ? 'warning' : 'danger'}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isProcessing}
      />
    </>
  );
};
