import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog = ({ isOpen, title, message, type, onConfirm, onCancel, isLoading }: ConfirmDialogProps) => {
  const Icon = type === 'danger' ? AlertCircle : AlertTriangle;
  const iconColor = type === 'danger' ? 'text-destructive' : 'text-accent';
  const borderColor = type === 'danger' ? 'border-destructive/30' : 'border-accent/30';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] pointer-events-auto overflow-hidden"
            >
              {/* Header with Icon */}
              <div className={`relative p-6 border-b ${borderColor} bg-gradient-to-r from-card/95 via-card/98 to-card/95`}>
                {/* Animated gradient line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${type === 'danger' ? 'via-destructive' : 'via-accent'} to-transparent`}
                />

                <div className="flex items-start gap-4">
                  {/* Animated Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                    className={`p-3 rounded-xl ${type === 'danger' ? 'bg-destructive/10' : 'bg-accent/10'} ${type === 'danger' ? 'border border-destructive/20' : 'border border-accent/20'}`}
                  >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </motion.div>

                  {/* Title */}
                  <div className="flex-1">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`text-xl font-black font-mono ${iconColor}`}
                    >
                      {title}
                    </motion.h3>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 90,
                      backgroundColor: "rgba(156, 163, 175, 0.1)" // muted/10
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onCancel}
                    disabled={isLoading}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6"
              >
                <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-5 py-2.5 text-sm font-bold rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: type === 'danger' ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 20px rgba(233, 113, 77, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-5 py-2.5 text-sm font-bold rounded-xl text-white shadow-lg transition-all relative overflow-hidden
                      ${type === 'danger' 
                        ? 'bg-destructive hover:bg-destructive/90' 
                        : 'bg-accent hover:bg-accent/90'
                      }
                      ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {/* Loading spinner */}
                    {isLoading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block mr-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    )}
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
