import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  RefreshCcw,
  ArrowRightLeft,
  Trophy,
  Frown,
  Minus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import { triggerWinEffects } from "@/lib/fireworks";
import { GameHeader } from "@/components/games/GameHeader";
import useDocumentTitle from "@/hooks/useDocumentTitle";

type SquareValue = "X" | "O" | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares: SquareValue[]) {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: WIN_LINES[i] };
    }
  }
  return null;
}

function getBotMove(squares: SquareValue[], botPiece: "X" | "O") {
  const playerPiece = botPiece === "X" ? "O" : "X";

  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    const line = [squares[a], squares[b], squares[c]];
    if (
      line.filter((x) => x === botPiece).length === 2 &&
      line.includes(null)
    ) {
      const idx = WIN_LINES[i].find((idx) => squares[idx] === null);
      if (idx !== undefined) return idx;
    }
  }

  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    const line = [squares[a], squares[b], squares[c]];
    if (
      line.filter((x) => x === playerPiece).length === 2 &&
      line.includes(null)
    ) {
      const idx = WIN_LINES[i].find((idx) => squares[idx] === null);
      if (idx !== undefined) return idx;
    }
  }

  if (!squares[4]) return 4;

  const available = squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null) as number[];
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return -1;
}

export default function TicTacToe() {
  useDocumentTitle("Trò Tic Tac Toe");
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [playerPiece, setPlayerPiece] = useState<"X" | "O">("X");
  const [xIsNext, setXIsNext] = useState(true);
  const [isDraw, setIsDraw] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playSound } = useGameSound(soundEnabled);

  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner;
  const botPiece = playerPiece === "X" ? "O" : "X";
  const isPlayerTurn =
    (xIsNext && playerPiece === "X") || (!xIsNext && playerPiece === "O");

  useEffect(() => {
    if (winner) {
      if (winner === playerPiece) {
        triggerWinEffects();
        playSound("win");
      } else {
        playSound("lose");
      }
    } else if (!squares.includes(null)) {
      setIsDraw(true);
      playSound("draw");
    }
  }, [winner, squares, playerPiece, playSound]);

  useEffect(() => {
    if (!isPlayerTurn && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const move = getBotMove(squares, botPiece);
        if (move !== -1) handleMove(move);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, isDraw, squares, botPiece]);

  const handleMove = (i: number) => {
    if (squares[i] || winner || isDraw) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    playSound("pop");
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsDraw(false);
    setXIsNext(true); // X luôn đi trước
  };

  const switchPiece = () => {
    playSound("button1");
    setPlayerPiece((prev) => (prev === "X" ? "O" : "X"));
    resetGame();
  };

  return (
    <>
      <GameHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 bg-[var(--ttt-bg-gradient)]">
        {/* 1. KHU VỰC ĐIỂM SỐ */}
        <div className="flex flex-col mb-5">
          <div className="flex items-center gap-8 mb-8">
            <div
              className={cn(
                "flex flex-col items-center transition-all",
                isPlayerTurn ? "scale-110 opacity-100" : "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg mb-2",
                  playerPiece === "X"
                    ? "bg-[var(--ttt-text-x)] text-white"
                    : "bg-[var(--ttt-text-o)] text-white"
                )}
              >
                {playerPiece}
              </div>
              <span className="font-bold text-xs uppercase tracking-tighter text-muted-foreground">
                Bạn
              </span>
            </div>

            <div className="text-xl font-black opacity-20 italic">VS</div>

            <div
              className={cn(
                "flex flex-col items-center transition-all",
                !isPlayerTurn ? "scale-110 opacity-100" : "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg mb-2",
                  botPiece === "X"
                    ? "bg-[var(--ttt-text-x)] text-white"
                    : "bg-[var(--ttt-text-o)] text-white"
                )}
              >
                {botPiece}
              </div>
              <span className="font-bold text-xs uppercase tracking-tighter text-muted-foreground">
                Bot
              </span>
            </div>
          </div>
          <p className="text-center text-muted-foreground text-lg font-bold uppercase opacity-70">
            <span className="text-red-500 font-black">X</span> sẽ được đi trước
          </p>
        </div>

        {/* GAME BOARD */}
        <div className="relative p-6 rounded-[2.5rem] border-2 border-border shadow-2xl bg-[var(--ttt-board-bg)]">
          <div className="grid grid-cols-3 gap-4">
            {squares.map((sq, i) => (
              <button
                key={i}
                onClick={() => isPlayerTurn && handleMove(i)}
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-5xl font-black transition-all",
                  "bg-[var(--ttt-cell-bg)] hover:bg-[var(--ttt-cell-hover)] shadow-inner",
                  // Màu sắc quân cờ theo biến CSS
                  sq === "X" && "text-[var(--ttt-text-x)]",
                  sq === "O" && "text-[var(--ttt-text-o)]",
                  // Hiệu ứng khi thắng
                  winInfo?.line.includes(i) &&
                    (sq === "X"
                      ? "bg-[var(--ttt-text-x)] text-white scale-105"
                      : "bg-[var(--ttt-text-o)] text-white scale-105")
                )}
              >
                <AnimatePresence>
                  {sq && (
                    <motion.span
                      initial={{ scale: 0.2, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      {sq}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* OVERLAY KẾT QUẢ */}
          <AnimatePresence>
            {(winner || isDraw) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--ttt-board-bg)] backdrop-blur-sm rounded-[2.5rem]"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="text-center"
                >
                  {winner ? (
                    <>
                      <div className="mb-2">
                        {winner === playerPiece ? (
                          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                        ) : (
                          <Frown className="w-16 h-16 text-gray-400 mx-auto" />
                        )}
                      </div>
                      <h2
                        className={cn(
                          "text-3xl font-black uppercase mb-6",
                          winner === "X" ? "text-red-500" : "text-blue-500"
                        )}
                      >
                        {winner === playerPiece ? "THẮNG RỒI!" : "THUA RỒI!"}
                      </h2>
                    </>
                  ) : (
                    <>
                      <Minus className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <h2 className="text-3xl font-black uppercase text-gray-600 mb-6">
                        HÒA NHAU!
                      </h2>
                    </>
                  )}

                  <RoundButton
                    size="medium"
                    variant={
                      winner === "X"
                        ? "danger"
                        : winner === "O"
                        ? "primary"
                        : "neutral"
                    }
                    onClick={() => {
                      resetGame();
                      playSound("button");
                    }}
                  >
                    Chơi ván mới
                  </RoundButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="flex gap-4 mt-10">
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => {
              resetGame();
              playSound("button");
            }}
          >
            <RefreshCcw className="w-5 h-5" />
          </RoundButton>
          <RoundButton
            size="small"
            variant="accent"
            onClick={switchPiece}
            className="gap-2"
          >
            <ArrowRightLeft className="w-5 h-5" /> Đổi quân (Bot X)
          </RoundButton>

          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-12 px-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </RoundButton>
        </div>
      </div>
    </>
  );
}
