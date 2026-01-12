import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const CustomToast = ({ message, type }: CustomToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  const styles = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border backdrop-blur-xl',
        'admin-surface shadow-lg',
        styles[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-mono text-foreground font-medium">{message}</p>
    </div>
  );
};
