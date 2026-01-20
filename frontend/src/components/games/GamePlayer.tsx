import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import type { Game } from "@/types/game";

// Lazy load game components
const CaroGame = lazy(() => import("@/pages/games/CaroGame"));
const TicTacToe = lazy(() => import("@/pages/games/TicTacToe"));
const SnakeGame = lazy(() => import("@/pages/games/Snake"));
const Match3Game = lazy(() => import("@/pages/games/Match3Game"));
const MemoryModeSelection = lazy(() => import("@/pages/games/MemoryModeSelection"));
const DrawingGame = lazy(() => import("@/pages/games/DrawingGame"));

interface GamePlayerProps {
  game: Game;
  onBack: () => void;
}

export const GamePlayer = ({ game, onBack }: GamePlayerProps) => {
  const renderGame = () => {
    switch (game.code) {
      case "caro":
        return <CaroGame gameId={1} winCondition={5} onBack={onBack} />;
      case "caro-4":
        return <CaroGame gameId={2} winCondition={4} onBack={onBack} />;
      case "tic-tac-toe":
        return <TicTacToe onBack={onBack} />;
      case "snake":
        return <SnakeGame onBack={onBack} />;
      case "match3":
        return <Match3Game onBack={onBack} />;
      case "memory":
        return <MemoryModeSelection onBack={onBack} />;
      case "drawing":
        return <DrawingGame onBack={onBack} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-card/50 rounded-xl border border-dashed border-border">
            <h3 className="text-xl font-bold mb-2">Đang phát triển</h3>
            <p>Trò chơi "{game.name}" sẽ sớm ra mắt!</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4 text-primary">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-bold animate-pulse">Đang tải tài nguyên trò chơi...</p>
          </div>
        }
      >
        <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden bg-background">
          {renderGame()}
        </div>
      </Suspense>
    </div>
  );
};
