import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '@/services/admin/gameService';
import { GameConfigForm } from './GameConfigForm';

interface GameConfigModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: Record<string, any>) => void;
}

export const GameConfigModal = ({ game, isOpen, onClose, onSubmit }: GameConfigModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-card/95 via-card/98 to-card/95 backdrop-blur-xl border-b border-primary/20 p-6 flex items-center justify-between relative overflow-hidden">
                {/* Animated gradient line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent origin-left"
                />

                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-black font-mono uppercase tracking-wider bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x"
                  >
                    Chỉnh sửa cấu hình
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground font-mono mt-1"
                  >
                    {game.name} | Mã: <span className="admin-primary font-bold">{game.code.toUpperCase()}</span>
                  </motion.p>
                </div>

                {/* Enhanced Close Button */}
                <motion.button
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 90,
                    backgroundColor: "rgba(239, 68, 68, 0.1)" // destructive/10
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="relative p-2.5 rounded-xl transition-all duration-200 border border-border/50 hover:border-destructive/50 group cursor-pointer"
                >
                  <X className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />

                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-destructive/0 group-hover:bg-destructive/5 blur-sm -z-10"
                    whileHover={{ scale: 1.5 }}
                  />
                </motion.button>
              </div>

              {/* Form */}
              <div className="p-6">
                <GameConfigForm
                  game={game}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
