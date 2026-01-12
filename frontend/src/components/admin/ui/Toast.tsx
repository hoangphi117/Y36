import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast as hotToast } from 'react-hot-toast';
import type { Toast as HotToast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ToastProps {
  t: HotToast;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const Toast = ({ t, message, type }: ToastProps) => {
  const config = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-500/10 border-green-500/30',
      iconClass: 'text-green-500',
      progressClass: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-red-500/10 border-red-500/30',
      iconClass: 'text-red-500',
      progressClass: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-yellow-500/10 border-yellow-500/30',
      iconClass: 'text-yellow-500',
      progressClass: 'bg-yellow-500',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-500/10 border-blue-500/30',
      iconClass: 'text-blue-500',
      progressClass: 'bg-blue-500',
    },
  };

  const { icon: Icon, bgClass, iconClass, progressClass } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -50, scale: t.visible ? 1 : 0.95 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${bgClass}`}
      style={{
        background: 'hsl(var(--card) / 0.95)',
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-mono font-medium text-foreground">
        {message}
      </p>

      {/* Close Button */}
      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="flex-shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: t.duration ? t.duration / 1000 : 3, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 rounded-b-xl origin-left ${progressClass}`}
        style={{ width: '100%' }}
      />
    </motion.div>
  );
};

// Helper functions
export const showToast = {
  success: (message: string, duration = 3000) => {
    hotToast.custom((t) => <Toast t={t} message={message} type="success" />, {
      duration,
      position: 'top-center',
    });
  },

  error: (message: string, duration = 4000) => {
    hotToast.custom((t) => <Toast t={t} message={message} type="error" />, {
      duration,
      position: 'top-center',
    });
  },

  warning: (message: string, duration = 3500) => {
    hotToast.custom((t) => <Toast t={t} message={message} type="warning" />, {
      duration,
      position: 'top-center',
    });
  },

  info: (message: string, duration = 3000) => {
    hotToast.custom((t) => <Toast t={t} message={message} type="info" />, {
      duration,
      position: 'top-center',
    });
  },
};
