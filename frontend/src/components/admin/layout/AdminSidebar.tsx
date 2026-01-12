import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSound } from '@/hooks/useGameSound';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Người dùng', path: '/admin/users' },
  { icon: Gamepad2, label: 'Trò chơi', path: '/admin/games' },
  { icon: BarChart3, label: 'Thống kê', path: '/admin/stats' },
];

export const AdminSidebar = () => {
  const { playSound } = useGameSound(true);

  const handleLogout = () => {
    playSound('button1');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl z-50 hidden lg:block">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-black tracking-wider">
          <span className="text-primary">ADMIN</span>
          <span className="text-accent">_PANEL</span>
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Game Management System
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => playSound('button2')}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group',
                'hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]',
                isActive
                  ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] font-bold'
                  : 'text-foreground/70 hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-mono font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer w-full',
            'text-destructive hover:bg-destructive/10 hover:shadow-[0_0_15px_rgba(var(--destructive),0.3)]'
          )}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-mono font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
