import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AdminTheme = 'light' | 'dark';

interface AdminThemeState {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

export const useAdminTheme = create<AdminThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        // Update DOM immediately
        const root = document.documentElement;
        root.classList.remove('admin-light', 'admin-dark');
        root.classList.add(`admin-${theme}`);
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Update DOM immediately
          const root = document.documentElement;
          root.classList.remove('admin-light', 'admin-dark');
          root.classList.add(`admin-${newTheme}`);
          return { theme: newTheme };
        }),
    }),
    {
      name: 'admin-theme-storage',
    }
  )
);
