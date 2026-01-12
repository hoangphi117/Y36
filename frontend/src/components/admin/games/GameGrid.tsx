import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <span className="text-4xl">🎮</span>
        </div>
        <h3 className="text-xl font-black text-foreground mb-2 font-mono">
          Không tìm thấy trò chơi
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn
        </p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {games.map((game) => (
        <motion.div key={game.id} variants={itemVariants}>
          <GameCard
            game={game}
            onToggle={() => onToggle(game.id, !game.is_active)}
            onEdit={() => onEdit(game)}
            isUpdating={isUpdating}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
