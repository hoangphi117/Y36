import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
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
    sort: '-created_at',
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
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-destructive mb-2">Error Loading Games</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load games'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-primary font-mono mb-2">
              GAME_MANAGEMENT
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Quản lý cấu hình và trạng thái trò chơi
            </p>
          </div>
          {data?.games && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-mono">
                Tổng: <span className="text-primary font-bold">{data.games.length}</span> games
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <GameFilters filters={filters} onChange={handleFilterChange} />

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-card/50 rounded-2xl animate-pulse" />
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
      </div>

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
