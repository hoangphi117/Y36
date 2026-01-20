// src/components/layouts/GameLayout.tsx
import { GameRating } from "@/components/ratings/GameRating";
import { GameComments } from "@/components/comments/GameComments";
import { AchievementPopup } from "../dialogs/AchievementPopup";

interface GameLayoutProps {
  gameId: number;
  children: React.ReactNode;
}

/**
 * Layout chung cho tất cả các game
 * - Phần trên: Bàn game (children)
 * - Phần dưới: Rating và Comments
 */
export function GameLayout({ gameId, children }: GameLayoutProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Phần hiển thị Game */}
      <div className="w-full">
        {children}
        <AchievementPopup />
      </div>

      {/* Phần Rating và Comments */}
      <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
        <GameRating gameId={gameId} />
        <GameComments gameId={gameId} />
      </div>
    </div>
  );
}
