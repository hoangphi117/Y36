import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AdminLayout = () => {
  const { theme } = useAdminTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? 80 : 256,
        }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
        style={{ willChange: 'margin-left' }}
        className="min-h-screen"
      >
        <AdminHeader />
        
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ isAnimating }} />
          </div>
        </main>
      </motion.div>
    </div>
  );
};
