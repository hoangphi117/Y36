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
              <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border/50 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-cyan-400 font-mono uppercase tracking-wider">
                    Chỉnh sửa cấu hình
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {game.name} | Mã: {game.code.toUpperCase()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
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
