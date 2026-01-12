import type { Game } from '@/services/admin/gameService';
import { GameCard } from './GameCard';

interface GameGridProps {
  games: Game[];
  onToggle: (id: number, isActive: boolean) => void;
  onEdit: (game: Game) => void;
  isUpdating: boolean;
}

export const GameGrid = ({ games, onToggle, onEdit, isUpdating }: GameGridProps) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-bold">No games found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onToggle={() => onToggle(game.id, !game.is_active)}
          onEdit={() => onEdit(game)}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
};
