import { User } from '@/services/admin/userService';
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-card/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-bold">No users found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-card/50 border-b border-border">
            <th className="text-left p-4 font-mono text-sm text-muted-foreground">USER</th>
            <th className="text-left p-4 font-mono text-sm text-muted-foreground">EMAIL</th>
            <th className="text-left p-4 font-mono text-sm text-muted-foreground">ROLE</th>
            <th className="text-left p-4 font-mono text-sm text-muted-foreground">STATUS</th>
            <th className="text-left p-4 font-mono text-sm text-muted-foreground">JOINED</th>
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              isProcessing={isProcessing}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
