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
    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-lg transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{game.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">ID: {game.id}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {game.description}
      </p>

      {/* Config Preview */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <p className="text-xs font-mono text-muted-foreground mb-1">Config:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(game.default_config).slice(0, 3).map(([key, value]) => (
            <span key={key} className="text-xs font-mono bg-background px-2 py-1 rounded">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <GameToggle
            isActive={game.is_active}
            onToggle={onToggle}
            disabled={isUpdating}
          />
          <span className={cn(
            'text-sm font-mono font-bold',
            game.is_active ? 'text-primary' : 'text-muted-foreground'
          )}>
            {game.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <button
          onClick={onEdit}
          disabled={isUpdating}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
};
