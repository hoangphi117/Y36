import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  RefreshCcw,
  Volume2,
  VolumeX,
  Trophy,
  Frown,
  Loader2,
  Upload,
  Download,
  Clock,
  LogOut,
  User,
  Bot,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import { triggerWinEffects } from "@/lib/fireworks";
import { GameHeader } from "@/components/games/GameHeader";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";

import { LoadGameDialog } from "./LoadGameDialog";

const BOARD_SIZE = 15;

interface CaroGameProps {
  gameId: number;
  winCondition: number;
}

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
    const r = Math.floor(i / BOARD_SIZE);
    const c = i % BOARD_SIZE;
    let hasNeighbor = false;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nr = r + dx,
          nc = c + dy;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[nr * BOARD_SIZE + nc] !== null) {
            hasNeighbor = true;
            break;
          }
        }
      }
      if (hasNeighbor) break;
    }
    if (!hasNeighbor) continue;
    let score = 0;
    board[i] = botPiece;
    if (checkWin(board, i, winCondition)) score += 10000;
    else if (checkWin(board, i, winCondition - 1)) score += 100;
    board[i] = null;
    board[i] = playerPiece;
    if (checkWin(board, i, winCondition)) score += 5000;
    else if (checkWin(board, i, winCondition - 1)) score += 80;
    board[i] = null;
    score +=
      Math.random() * 5 -
      (Math.abs(r - BOARD_SIZE / 2) + Math.abs(c - BOARD_SIZE / 2));
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  if (move === -1) {
    const empties = board
      .map((v, k) => (v === null ? k : null))
      .filter((v) => v !== null) as number[];
    if (empties.length > 0)
      return empties[Math.floor(Math.random() * empties.length)];
  }
  return move;
};

export default function CaroGame({ gameId, winCondition }: CaroGameProps) {
  useDocumentTitle(`Cờ Caro (${winCondition} ô)`);

  const [board, setBoard] = useState<(string | null)[]>(
    Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  );
  const [playerPiece, setPlayerPiece] = useState<"X" | "O">("X");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playSound: originalPlaySound } = useGameSound();
  const playSound = (type: string) =>
    soundEnabled && originalPlaySound(type as any);
  const botPiece = playerPiece === "X" ? "O" : "X";

  const boardRef = useRef(board);
  const playerPieceRef = useRef(playerPiece);
  const isPlayerTurnRef = useRef(isPlayerTurn);
  const winnerRef = useRef(winner);

  useEffect(() => {
    boardRef.current = board;
    playerPieceRef.current = playerPiece;
    isPlayerTurnRef.current = isPlayerTurn;
    winnerRef.current = winner;
  }, [board, playerPiece, isPlayerTurn, winner]);

  const getBoardState = useCallback(
    () => ({
      board: boardRef.current,
      playerPiece: playerPieceRef.current,
      isPlayerTurn: isPlayerTurnRef.current,
      winner: winnerRef.current,
    }),
    []
  );

  const {
    session,
    currentPlayTime,
    savedSessions,
    isLoading,
    isSaving,
    showLoadDialog,
    setShowLoadDialog,
    startGame,
    loadGame,
    saveGame,
    completeGame,
    quitGame,
    fetchSavedSessions,
    resetTimer,
  } = useGameSession({ gameId, getBoardState });

  console.log("CaroGame session:", session);

  const handleRestart = async () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setPlayerPiece("X");
    resetTimer();
    await startGame();
  };

  const handleSwitchSide = (p: "X" | "O") => {
    setPlayerPiece(p);
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    resetTimer();
  };

  const handleManualSave = () => saveGame(true);
  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (session?.board_state) {
      const state = session.board_state;
      if (state.board) setBoard(state.board);
      if (state.playerPiece) setPlayerPiece(state.playerPiece);
      if (state.isPlayerTurn !== undefined) setIsPlayerTurn(state.isPlayerTurn);
      setWinner(null);
      setWinningLine([]);
    } else if (session && !session.board_state) {
      setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
      setWinner(null);
      setWinningLine([]);
      setIsPlayerTurn(true);
    }
  }, [session]);

  const handleMove = useCallback(
    (index: number, piece: string) => {
      if (board[index] || winner || session?.status !== "playing") return;
      playSound("pop");
      const newBoard = [...board];
      newBoard[index] = piece;
      setBoard(newBoard);
      const winLine = checkWin(newBoard, index, winCondition);
      if (winLine) {
        setWinner(piece);
        setWinningLine(winLine);
      } else {
        setIsPlayerTurn(piece !== playerPiece);
      }
    },
    [board, winner, winCondition, playerPiece, session?.status, playSound]
  );

  useEffect(() => {
    if (!session || session.status !== "playing" || winner) return;
    const xCount = board.filter((c) => c === "X").length;
    const oCount = board.filter((c) => c === "O").length;
    const isXTurn = xCount === oCount;
    const currentTurnSymbol = isXTurn ? "X" : "O";
    const isBotTurn = currentTurnSymbol === botPiece;
    if (isBotTurn) {
      const timer = setTimeout(() => {
        const move = getBestMove(board, winCondition, botPiece, playerPiece);
        if (move !== -1) handleMove(move, botPiece);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [board, winCondition, botPiece, playerPiece, winner, session]);

  useEffect(() => {
    if (session?.status === "playing") {
      if (winner) {
        if (winner === playerPiece) {
          playSound("win");
          triggerWinEffects();
          completeGame(1);
        } else {
          playSound("lose");
          completeGame(-1);
        }
      } else if (board.every((cell) => cell !== null)) {
        playSound("draw");
        completeGame(0);
      }
    }
  }, [winner, board, playerPiece, session?.status]);

  const isBoardEmpty = board.every((c) => c === null);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse font-medium text-muted-foreground">
          Đang tải dữ liệu Caro {winCondition} ô...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground transition-colors duration-300">
      <GameHeader />
      <div className="flex flex-col items-center justify-center py-4 px-4 w-full max-w-4xl">
        {/* HEADER */}
        <div className="text-center mb-4 space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-primary uppercase tracking-wider italic drop-shadow-[0_2px_10px_rgba(var(--primary),0.5)]">
            CARO {winCondition}
          </h1>
          <div className="h-8 flex items-center justify-center gap-2">
            <div className="font-mono text-lg font-bold text-primary flex items-center gap-2 bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
              <Clock className="w-4 h-4" /> {formatTime(currentPlayTime)}
            </div>
            <div className="w-[1px] h-6 bg-border mx-2"></div>
            {winner ? (
              <span
                className={cn(
                  "text-xl font-bold animate-bounce",
                  winner === playerPiece ? "text-primary" : "text-destructive"
                )}
              >
                {winner === playerPiece ? "🎉 BẠN THẮNG!" : "🤖 BOT THẮNG!"}
              </span>
            ) : (
              <span className="text-muted-foreground font-medium animate-pulse">
                {(board.filter((c) => c !== null).length % 2 === 0 &&
                  playerPiece === "X") ||
                (board.filter((c) => c !== null).length % 2 !== 0 &&
                  playerPiece === "O")
                  ? "Lượt của bạn..."
                  : "Bot đang tính..."}
              </span>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center relative z-20">
          <RoundButton
            onClick={handleManualSave}
            disabled={isSaving || !!winner || session?.status !== "playing"}
            variant="primary"
            className="flex items-center gap-2 px-4"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}{" "}
            Lưu
          </RoundButton>

          <LoadGameDialog
            open={showLoadDialog}
            onOpenChange={setShowLoadDialog}
            sessions={savedSessions}
            currentSessionId={session?.id}
            onLoadSession={loadGame}
            onNewGame={startGame}
          >
            {/* Nút Trigger nằm ở đây */}
            <RoundButton
              variant="neutral"
              className="flex items-center gap-2 px-4"
              onClick={handleOpenSavedGames}
            >
              <Download className="w-4 h-4" /> Tải
            </RoundButton>
          </LoadGameDialog>

          {/* --- NÚT CHUYỂN CHẾ ĐỘ / MENU LINK --- */}

          {isBoardEmpty && session?.status === "playing" && (
            <div className="flex bg-muted p-1 rounded-full border border-border">
              <button
                onClick={() => handleSwitchSide("X")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                  playerPiece === "X"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <User className="w-3 h-3" /> X
              </button>
              <button
                onClick={() => handleSwitchSide("O")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                  playerPiece === "O"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <Bot className="w-3 h-3" /> O
              </button>
            </div>
          )}

          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </RoundButton>

          <RoundButton
            size="small"
            variant="neutral"
            onClick={quitGame}
            title="Thoát"
          >
            <LogOut className="w-4 h-4" />
          </RoundButton>
        </div>

        {/* BOARD (Giữ nguyên) */}
        <div className="relative p-2 sm:p-3 bg-[var(--board-bg)] rounded-[1.5rem] shadow-2xl border-4 border-primary/30 transition-colors duration-300 overflow-hidden">
          <div
            className="grid gap-[1px] bg-border border-2 border-border"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {board.map((cell, index) => (
              <button
                key={index}
                disabled={!!cell || !!winner || session?.status !== "playing"}
                onClick={() => handleMove(index, playerPiece)}
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-sm sm:text-lg md:text-xl font-black leading-none transition-colors duration-200",
                  "bg-[var(--board-bg)] hover:bg-[var(--cell-hover)]",
                  winningLine.includes(index) &&
                    "bg-accent/80 animate-pulse z-10"
                )}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "font-black select-none drop-shadow-sm",
                        cell === playerPiece
                          ? "text-[var(--game-x)]"
                          : "text-[var(--game-o)]"
                      )}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* OVERLAY KẾT THÚC (Giữ nguyên) */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-card p-6 md:p-8 rounded-[2rem] text-center shadow-2xl border-4 border-accent w-[90%] max-w-sm"
                >
                  {winner === playerPiece ? (
                    <Trophy className="w-16 h-16 text-accent mx-auto mb-2 animate-bounce" />
                  ) : (
                    <Frown className="w-16 h-16 text-destructive mx-auto mb-2" />
                  )}
                  <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase text-card-foreground">
                    {winner === playerPiece ? (
                      <span className="text-primary">XUẤT SẮC!</span>
                    ) : (
                      <span className="text-destructive">THUA RỒI!</span>
                    )}
                  </h2>
                  <div className="flex gap-3 justify-center">
                    <RoundButton variant="neutral" onClick={quitGame}>
                      Thoát
                    </RoundButton>
                    <RoundButton variant="accent" onClick={handleRestart}>
                      <RefreshCcw className="w-4 h-4 mr-2" /> Chơi Lại
                    </RoundButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
