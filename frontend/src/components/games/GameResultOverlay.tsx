import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import { Trophy, Frown, RefreshCcw, LogOut, Minus, AlertTriangle } from "lucide-react";

type Winner = "user" | "bot" | null;
type GameType = "snake" | "caro" | "tictactoe";

interface GameResultOverlayProps {
  status: string; // or more specific GameStatus type if possible to enforce
  winner?: Winner;
  score?: number;
  onRestart: () => void;
  onQuit: () => void;
  gameType: GameType;
  reason?: string | null;
}

export function GameResultOverlay({
  status,
  winner,
  score,
  onRestart,
  onQuit,
  gameType,
  reason,
}: GameResultOverlayProps) {
  // Only show overlay if game is essentially "over" in some way that requires user action
  // For snake, "lose" is game over.
  // For others, win/lose/draw/timeout are game over states.
  const isGameOver =
    status === "win" || 
    status === "lose" || 
    status === "draw" || 
    status === "timeout" ||
    (status === "playing" && !!winner);

  // Special handling for Snake which might just use "isGameOver" boolean logic in parent,
  // but if we pass "lose" as status, it works.
  
  if (!isGameOver) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[inherit]" // Inherit border radius from parent container if needed
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-2xl text-center space-y-4 w-[90%] max-w-sm mx-4"
        >
          {status === "timeout" ? (
            <>
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold uppercase">Hết giờ!</h2>
              {reason === "turn" && <p className="text-sm text-muted-foreground">Bạn đã hết thời gian lượt đi</p>}
              <p className="text-sm text-muted-foreground">-1 Điểm</p>
            </>
          ) : status === "draw" ? (
            <>
              <Minus className="w-16 h-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold uppercase">Hòa!</h2>
              <p className="text-sm text-muted-foreground">+0 Điểm</p>
            </>
          ) : status === "win" || (status === "playing" && winner === "user") ? ( 
             // Logic: TicTacToe/Caro usually set status to 'playing' but have a 'winner'. 
             // WE SHOULD NORMALIZE THIS in the parent components to pass strict 'win'/'lose' via props,
             // OR handle it here. 
             // Better to assume parent calculates true status. 
             // IF parent passes 'win', it means USER won.
             // IF parent passes 'lose', it means USER lost.
             // Snake only has 'lose' (game over).
             <>
               <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
               <h2 className="text-2xl font-bold uppercase">
                 {gameType === "snake" ? "Game Over!" : "Bạn Thắng!"}
               </h2>
               {score !== undefined && (
                 <p className="text-lg font-mono font-bold text-primary">
                   Điểm: {score}
                 </p>
               )}
               {gameType !== "snake" && <p className="text-sm text-muted-foreground">+1 Điểm</p>}
             </>
          ) : (
            // User Lost
            <>
              <Frown className="w-16 h-16 text-destructive mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold uppercase">
                 {gameType === "snake" ? "Thua R\u1ed3i!" : "B\u1ea1n Thua!"}
              </h2>
               {score !== undefined && (
                 <p className="text-lg font-mono font-bold text-primary">
                   Điểm: {score}
                 </p>
               )}
              {gameType !== "snake" && <p className="text-sm text-muted-foreground">-1 Điểm</p>}
            </>
          )}

          <div className="flex gap-2 justify-center pt-2">
            <RoundButton variant="neutral" onClick={onQuit}>
              <LogOut className="w-4 h-4 mr-2" />
              Thoát
            </RoundButton>
            <RoundButton variant="primary" onClick={onRestart}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Chơi lại
            </RoundButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
