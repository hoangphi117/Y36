import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';
import { useEffect, useState, useMemo } from 'react';

export const AdminLayout = () => {
  const { theme } = useAdminTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Memoize padding class to prevent re-calculation
  const mainPaddingClass = useMemo(
    () => `transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`,
    [sidebarCollapsed]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Container - Global cho toàn bộ Admin */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />

      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={mainPaddingClass}>
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
