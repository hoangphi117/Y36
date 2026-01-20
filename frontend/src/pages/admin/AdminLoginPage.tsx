import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLogin } from '@/hooks/admin/useAdminAuth';
import { adminAuthService } from '@/services/admin/authService';
import { useAdminTheme } from '@/hooks/admin/useAdminTheme';
import { Eye, EyeOff, Lock, Mail, Shield, LogIn, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminInput } from '@/components/admin/ui/AdminInput';
import { Toaster } from 'react-hot-toast';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export const AdminLoginPage = () => {
  useDocumentTitle("Login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();
  const { theme } = useAdminTheme();

  // Force apply admin theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(`admin-${theme}`);
    
    return () => {
      root.classList.remove('admin-light', 'admin-dark');
      const customerTheme = localStorage.getItem('vite-ui-theme') || 'dark';
      root.classList.add(customerTheme);
    };
  }, [theme]);

  // Auto-focus email input
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (adminAuthService.isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    loginMutation.mutate({ email, password });
  };

  return (
    <>
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 20,
          zIndex: 99999,
        }}
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      />
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)
              }}
              animate={{
                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-2xl opacity-20 animate-pulse" />
          
          <div className="relative admin-surface p-8 rounded-3xl shadow-2xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(45, 181, 163, 0.2)',
                    '0 0 40px rgba(45, 181, 163, 0.4)',
                    '0 0 20px rgba(45, 181, 163, 0.2)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
              >
                <Shield className="w-10 h-10 text-primary animate-pulse" />
              </motion.div>
              
              <h1 className="text-4xl font-black text-primary font-mono mb-2 flex items-center justify-center gap-2">
                ADMIN
                <KeyRound className="w-6 h-6 text-primary animate-pulse" />
              </h1>
              <p className="text-muted-foreground text-sm font-mono">
                Khu vực quản trị viên
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-bold text-foreground mb-2 font-mono uppercase tracking-wider">
                  Email
                </label>
                <AdminInput
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  disabled={loginMutation.isPending}
                  placeholder="admin@example.com"
                  icon={<Mail className="w-5 h-5 text-foreground opacity-60" strokeWidth={2.5} />}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-destructive text-xs mt-1 font-mono"
                    >
                      ⚠ {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-bold text-foreground mb-2 font-mono uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground opacity-60" strokeWidth={2.5} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit(e);
                    }}
                    disabled={loginMutation.isPending}
                    className="admin-input pl-10 pr-12"
                    placeholder="••••••••"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded-lg transition-colors z-10"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-foreground opacity-60" strokeWidth={2.5} />
                    ) : (
                      <Eye className="w-5 h-5 text-foreground opacity-60" strokeWidth={2.5} />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-destructive text-xs mt-1 font-mono"
                    >
                      ⚠ {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full admin-btn-primary flex items-center justify-center gap-2 py-3 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Đăng nhập</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-6 border-t border-border"
            >
              <p className="text-center text-xs text-muted-foreground font-mono">
                Trang đăng nhập dành cho quản trị viên hãy đảm bảo bạn có quyền truy cập hợp lệ.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
