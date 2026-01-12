import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';
import { useEffect } from 'react';

export const AdminLayout = () => {
  const { theme } = useAdminTheme();

  // Force apply admin theme on mount
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove customer theme
    root.classList.remove('light', 'dark');
    
    // Add admin theme
    root.classList.add(`admin-${theme}`);
    
    // Cleanup: Restore customer theme when leaving admin
    return () => {
      root.classList.remove('admin-light', 'admin-dark');
      
      // Restore customer theme from localStorage
      const customerTheme = localStorage.getItem('vite-ui-theme') || 'dark';
      root.classList.add(customerTheme);
    };
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
