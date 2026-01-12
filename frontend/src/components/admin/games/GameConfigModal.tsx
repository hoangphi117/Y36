import { X } from 'lucide-react';
import type { Game } from '@/services/admin/gameService';
import { GameConfigForm } from './GameConfigForm';

interface GameConfigModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: Record<string, any>) => void;
}

export const GameConfigModal = ({ game, isOpen, onClose, onSubmit }: GameConfigModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary font-mono">
              EDIT_CONFIG: {game.name.toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Game ID: {game.id} | Code: {game.code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <GameConfigForm
            game={game}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
