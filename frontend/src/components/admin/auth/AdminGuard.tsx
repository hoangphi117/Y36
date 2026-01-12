import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
