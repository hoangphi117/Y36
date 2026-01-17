import { motion } from 'framer-motion';
import type { Game } from '@/services/admin/gameService';
import { GameToggle } from './GameToggle';
import { Settings, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onToggle: () => void;
  onEdit: () => void;
  isUpdating: boolean;
}

export const GameCard = ({ game, onToggle, onEdit, isUpdating }: GameCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'relative bg-card/50 backdrop-blur-xl border rounded-2xl p-6 transition-all group overflow-hidden',
        game.is_active
          ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]'
          : 'border-border/50 hover:border-border hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
      )}
    >
      {/* Active Indicator Glow */}
      {game.is_active && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              game.is_active
                ? 'bg-gradient-to-br from-green-500/20 to-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'bg-muted/50'
            )}
          >
            <Gamepad2 className={cn('w-6 h-6', game.is_active ? 'text-green-400' : 'text-muted-foreground')} />
          </motion.div>
          <div>
            <h3 className="font-bold text-foreground text-lg">{game.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Mã: {game.code.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
        {game.description}
      </p>

      {/* Config Preview */}
      <div className="admin-surface p-3 mb-4">
        <p className="text-xs font-mono admin-primary mb-2 uppercase tracking-wider font-bold">
          Cấu hình:
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(game.default_config).slice(0, 3).map(([key, value]) => (
            <span
              key={key}
              className="text-xs font-mono bg-muted border border-border px-2 py-1 rounded"
            >
              <span className="admin-accent font-bold">{key}:</span>{' '}
              <span className="text-foreground">{String(value)}</span>
            </span>
          ))}
          {Object.keys(game.default_config).length > 3 && (
            <span className="text-xs font-mono text-muted-foreground px-2 py-1">
              +{Object.keys(game.default_config).length - 3} khác...
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <GameToggle
            isActive={game.is_active}
            onToggle={onToggle}
            disabled={isUpdating}
          />
          <span
            className={cn(
              'text-sm font-mono font-bold transition-colors',
              game.is_active ? 'text-green-400' : 'text-muted-foreground'
            )}
          >
            {game.is_active ? 'HOẠT ĐỘNG' : 'TẠM DỪNG'}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          disabled={isUpdating}
          className={cn(
            'p-2 rounded-lg transition-all disabled:opacity-50',
            'hover:bg-primary/10'
          )}
        >
          <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
        </motion.button>
      </div>
    </motion.div>
  );
};
