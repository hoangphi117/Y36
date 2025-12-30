import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  RefreshCcw,
  Settings2,
  Volume2,
  VolumeX,
  Trophy,
  Frown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import { triggerWinEffects } from "@/lib/fireworks";

import { GameHeader } from "@/components/games/GameHeader";

const BOARD_SIZE = 15;

const checkWin = (
  board: (string | null)[],
  index: number,
  winCondition: number
) => {
  const player = board[index];
  if (!player) return null;

  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let winningCells = [index];

    for (let i = 1; i < winCondition; i++) {
      const r = row + i * dx,
        c = col + i * dy;
      const idx = r * BOARD_SIZE + c;
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[idx] !== player
      )
        break;
      count++;
      winningCells.push(idx);
    }
    for (let i = 1; i < winCondition; i++) {
      const r = row - i * dx,
        c = col - i * dy;
      const idx = r * BOARD_SIZE + c;
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[idx] !== player
      )
        break;
      count++;
      winningCells.push(idx);
    }
    if (count >= winCondition) return winningCells;
  }
  return null;
};

const getBestMove = (
  board: (string | null)[],
  winCondition: number,
  botPiece: string,
  playerPiece: string
) => {
  if (board.every((cell) => cell === null))
    return Math.floor((BOARD_SIZE * BOARD_SIZE) / 2);

  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue;
    let score = 0;

    board[i] = botPiece;
    if (checkWin(board, i, winCondition)) score += 10000;
    else if (checkWin(board, i, winCondition - 1)) score += 100;
    board[i] = null;

    board[i] = playerPiece;
    if (checkWin(board, i, winCondition)) score += 5000;
    else if (checkWin(board, i, winCondition - 1)) score += 80;
    board[i] = null;

    const r = Math.floor(i / BOARD_SIZE),
      c = i % BOARD_SIZE;
    score +=
      Math.random() * 5 -
      (Math.abs(r - BOARD_SIZE / 2) + Math.abs(c - BOARD_SIZE / 2));

    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
};

export default function CaroGame() {
  const [board, setBoard] = useState<(string | null)[]>(
    Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  );
  const [playerPiece, setPlayerPiece] = useState<"X" | "O">("X");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [winCondition, setWinCondition] = useState<4 | 5>(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playSound } = useGameSound(soundEnabled);
  const botPiece = playerPiece === "X" ? "O" : "X";

  const handleMove = useCallback(
    (index: number, piece: string) => {
      if (board[index] || winner) return;

      playSound("pop");
      const newBoard = [...board];
      newBoard[index] = piece;
      setBoard(newBoard);

      const winLine = checkWin(newBoard, index, winCondition);
      if (winLine) {
        setWinner(piece);
        setWinningLine(winLine);
        if (piece === playerPiece) {
          playSound("win");
          triggerWinEffects();
        } else {
          playSound("lose");
        }
      } else {
        setIsPlayerTurn(piece === botPiece);
      }
    },
    [board, winner, winCondition, playerPiece, botPiece, playSound]
  );

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const move = getBestMove(board, winCondition, botPiece, playerPiece);
        if (move !== -1) handleMove(move, botPiece);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    isPlayerTurn,
    winner,
    board,
    winCondition,
    botPiece,
    playerPiece,
    handleMove,
  ]);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
  };

  return (
    <>
      <GameHeader />
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-background">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-black text-primary uppercase tracking-wider italic">
            CARO {winCondition}
          </h1>
          <p className="text-muted-foreground font-bold h-6">
            {winner ? (
              <span
                className={cn(
                  "text-xl animate-bounce",
                  winner === playerPiece ? "text-primary" : "text-destructive"
                )}
              >
                {winner === playerPiece ? "🎉 CHIẾN THẮNG!" : "🤖 BOT THẮNG!"}
              </span>
            ) : (
              `Lượt đi: ${
                isPlayerTurn ? "Bạn (" + playerPiece + ")" : "Bot..."
              }`
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 justify-center items-center">
          <RoundButton
            size="small"
            variant="primary"
            onClick={() => {
              resetGame();
              playSound("button1");
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> CHƠI LẠI
          </RoundButton>

          <div className="flex bg-muted p-1 rounded-2xl border-2 border-border">
            {(["X", "O"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlayerPiece(p);
                  resetGame();
                  playSound("button1");
                }}
                className={cn(
                  "px-5 py-1 rounded-xl font-black transition-all cursor-pointer",
                  playerPiece === p
                    ? "bg-primary text-white shadow-md"
                    : "opacity-40"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <RoundButton
            size="small"
            variant="accent"
            onClick={() => {
              setWinCondition(winCondition === 5 ? 4 : 5);
              resetGame();
              playSound("button1");
            }}
          >
            <Settings2 className="w-4 h-4 mr-2" />{" "}
            {winCondition === 5 ? "CỬA 4" : "CỬA 5"}
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

        <div className="relative p-4 bg-white rounded-[2rem] shadow-[-12px_12px_0_rgba(0,0,0,0.1)] border-4 border-primary/20">
          <div
            className="grid gap-[1px] bg-gray-200 border-2 border-gray-200"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {board.map((cell, index) => (
              <button
                key={index}
                disabled={!!cell || !!winner || !isPlayerTurn}
                onClick={() => handleMove(index, playerPiece)}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-black leading-none transition-colors",
                  "bg-white hover:bg-green-50",
                  winningLine.includes(index) && "bg-yellow-300 animate-pulse"
                )}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                      className={cn(
                        "font-black text-2xl select-none",
                        cell === playerPiece ? "text-game-x" : "text-game-o"
                      )}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[1.8rem]"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-secondary p-8 rounded-[3rem] text-center shadow-2xl border-8 border-yellow-400"
                >
                  {winner === playerPiece ? (
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                  ) : (
                    <Frown className="w-20 h-20 text-red-500 mx-auto mb-4" />
                  )}
                  <h2 className="text-4xl font-black mb-6 uppercase">
                    {winner === playerPiece ? (
                      <span className="text-primary">XUẤT SẮC!</span>
                    ) : (
                      <span className="text-red-500">TIẾC QUÁ!</span>
                    )}
                  </h2>
                  <RoundButton
                    size="large"
                    variant="accent"
                    onClick={() => {
                      resetGame();
                      playSound("button");
                    }}
                  >
                    CHƠI LẠI NÀO
                  </RoundButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
