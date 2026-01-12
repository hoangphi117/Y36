import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  role: string;
  name: string;
  email: string;
}

export const AdminGuard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const user: User = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
          />
          <div className="text-center">
            <p className="text-foreground font-mono font-bold mb-1">Đang xác thực...</p>
            <p className="text-xs text-muted-foreground font-mono">Vui lòng đợi</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
