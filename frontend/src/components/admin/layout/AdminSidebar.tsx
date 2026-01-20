import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, BarChart3, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSound } from '@/hooks/useGameSound';
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.aside
      initial={false}
      animate={{ 
        transform: collapsed ? 'translateX(0)' : 'translateX(0)',
      }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        width: collapsed ? 80 : 256,
        willChange: 'transform',
      }}
      className="fixed left-0 top-0 h-screen border-r border-border bg-card/50 backdrop-blur-xl z-50 hidden lg:block"
    >
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-shadow hover:shadow-xl z-10"
      >
        <motion.div
          initial={false}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-black tracking-wider whitespace-nowrap">
                  <span className="text-primary">ADMIN</span>
                  <span className="text-accent">_PANEL</span>
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Hệ thống quản lý
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <span className="text-primary font-black text-lg">A</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {NAV_ITEMS.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => playSound('button2')}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer group overflow-hidden',
                'hover:bg-primary/10',
                isActive
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'text-foreground/70 hover:text-foreground'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ 
                    x: collapsed ? 0 : 0,
                    scale: isActive ? 1.1 : 1 
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="nav-label"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="font-mono font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-destructive hover:bg-destructive/10 overflow-hidden"
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-mono font-medium whitespace-nowrap"
              >
                Đăng xuất
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
