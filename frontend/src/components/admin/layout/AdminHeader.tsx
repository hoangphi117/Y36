import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import { RoundButton } from '@/components/ui/round-button';
import { useGameSound } from '@/hooks/useGameSound';
import { useEffect, useState } from 'react';

export const AdminHeader = () => {
  const { theme, setTheme } = useNextTheme();
  const { playSound } = useGameSound(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const toggleTheme = () => {
    playSound('button1');
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu */}
        <button className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        {/* Breadcrumb / Title */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-bold text-foreground font-mono">
            Welcome, <span className="text-primary">{user?.name || 'Admin'}</span>
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <RoundButton
            size="small"
            variant="neutral"
            onClick={toggleTheme}
            className="gap-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </RoundButton>

          {/* User Avatar */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
