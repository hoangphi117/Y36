import { motion } from 'framer-motion';
import type { Game } from '@/services/admin/gameService';
import { GameCard } from './GameCard';
import { Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  onToggle: (id: number, isActive: boolean) => void;
  onEdit: (game: Game) => void;
  isUpdating: boolean;
}

export const GameGrid = ({ games, onToggle, onEdit, isUpdating }: GameGridProps) => {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Gamepad2 className="w-10 h-10 text-muted-foreground animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-foreground mb-2 font-mono">
          Không tìm thấy trò chơi
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <motion.div
          key={game.id}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GameCard
            game={game}
            onToggle={() => onToggle(game.id, !game.is_active)}
            onEdit={() => onEdit(game)}
            isUpdating={isUpdating}
          />
        </motion.div>
      ))}
    </div>
  );
};
