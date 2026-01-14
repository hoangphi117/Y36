import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';
import { motion } from 'framer-motion';

export const AdminHeader = () => {
  const { theme, setTheme } = useAdminTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm text-muted-foreground font-mono">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-foreground" />
          )}
        </motion.button>
      </div>
    </header>
  );
};
