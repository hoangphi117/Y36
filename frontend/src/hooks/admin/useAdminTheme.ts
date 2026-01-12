import { useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark';

const ADMIN_THEME_KEY = 'admin-theme';

export const useAdminTheme = () => {
  const [theme, setTheme] = useState<AdminTheme>(() => {
    const saved = localStorage.getItem(ADMIN_THEME_KEY);
    return (saved as AdminTheme) || 'dark'; // Default: dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // XÓA tất cả theme classes
    root.classList.remove('light', 'dark', 'admin-light', 'admin-dark');
    
    // THÊM admin theme class
    root.classList.add(`admin-${theme}`);
    
    // Lưu vào localStorage
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode: AdminTheme) => {
    setTheme(mode);
  };

  return {
    theme,
    toggleTheme,
    setThemeMode,
  };
};
