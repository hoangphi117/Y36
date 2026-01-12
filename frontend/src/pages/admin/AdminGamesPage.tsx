import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGames, useUpdateGame } from '@/hooks/admin/useGames';
import { GameGrid } from '@/components/admin/games/GameGrid';
import { GameConfigModal } from '@/components/admin/games/GameConfigModal';
import { GameFilters } from '@/components/admin/games/GameFilters';
import { useDebounce } from '@/hooks/useDebounce';
import type { Game, GameFilters as GameFiltersType } from '@/services/admin/gameService';

export const AdminGamesPage = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [filters, setFilters] = useState<GameFiltersType>({
    search: '',
    is_active: undefined,
    sort: 'id',
  });

  const debouncedSearch = useDebounce(filters.search || '', 500);

  const queryFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error } = useGames(queryFilters);
  const updateMutation = useUpdateGame();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, payload: { is_active: isActive } });
  };

  const handleConfigSubmit = (config: Record<string, any>) => {
    if (!selectedGame) return;
    updateMutation.mutate(
      { id: selectedGame.id, payload: { default_config: config } },
      {
        onSuccess: () => setSelectedGame(null),
      }
    );
  };

  if (isError) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-black text-red-400 mb-2 font-mono">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-sm text-muted-foreground font-mono mb-4">
              {error instanceof Error ? error.message : 'Không thể tải danh sách trò chơi'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary/20 border border-primary/40 text-primary rounded-lg font-mono text-sm hover:bg-primary/30 transition-all"
            >
              Thử lại
            </button>
          </motion.div>
        </div>
      </>
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
    <>
      <Toaster position="top-right" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/30">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground font-mono uppercase tracking-wider">
                Quản lý trò chơi
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                Cấu hình và quản lý trạng thái các trò chơi
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Tổng trò chơi
              </p>
              <p className="text-2xl font-black text-purple-400 font-mono">
                {data?.games?.length || 0}
              </p>
            </div>
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Đang hoạt động
              </p>
              <p className="text-2xl font-black text-green-400 font-mono">
                {data?.games?.filter(g => g.is_active).length || 0}
              </p>
            </div>
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Tạm dừng
              </p>
              <p className="text-2xl font-black text-red-400 font-mono">
                {data?.games?.filter(g => !g.is_active).length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <GameFilters filters={filters} onChange={handleFilterChange} />
        </motion.div>

        {/* Grid */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-80 bg-card/30 rounded-2xl animate-pulse border border-border/50"
                />
              ))}
            </div>
          ) : (
            <GameGrid
              games={data?.games || []}
              onToggle={handleToggle}
              onEdit={setSelectedGame}
              isUpdating={updateMutation.isPending}
            />
          )}
        </motion.div>
      </motion.div>

      {selectedGame && (
        <GameConfigModal
          game={selectedGame}
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          onSubmit={handleConfigSubmit}
        />
      )}
    </>
  );
};
