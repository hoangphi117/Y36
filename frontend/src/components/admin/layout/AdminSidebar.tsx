import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, BarChart3, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSound } from '@/hooks/useGameSound';
import { memo } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Users, label: 'Người dùng', path: '/admin/users' },
  { icon: Gamepad2, label: 'Trò chơi', path: '/admin/games' },
  { icon: BarChart3, label: 'Thống kê', path: '/admin/stats' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = memo(({ collapsed, onToggle }: AdminSidebarProps) => {
  const { playSound } = useGameSound(true);

  const handleLogout = () => {
    playSound('button1');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-border bg-card/50 backdrop-blur-xl z-50 hidden lg:block',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className={cn('transition-all duration-300', collapsed && 'flex justify-center')}>
          {!collapsed ? (
            <div>
              <h1 className="text-2xl font-black tracking-wider">
                <span className="text-primary">ADMIN</span>
                <span className="text-accent">_PANEL</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Hệ thống quản lý
              </p>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-black text-lg">A</span>
            </div>
          )}
        </div>
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
                'hover:bg-primary/10',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'text-foreground/70 hover:text-foreground'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" />
            {!collapsed && (
              <span className="font-mono font-medium whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer w-full',
            'text-destructive hover:bg-destructive/10',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-mono font-medium whitespace-nowrap overflow-hidden">
              Đăng xuất
            </span>
          )}
        </button>
      </div>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
