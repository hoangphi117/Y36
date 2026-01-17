import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Minus,
  Volume2,
  VolumeX,
  Loader2,
  LogOut,
  Download,
  Upload,
  Clock,
  Bot,
  User,
  RefreshCcw,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import { GameHeader } from "@/components/games/GameHeader";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "./LoadGameDialog";

const GAME_ID = 4;
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

type SquareValue = "X" | "O" | null;
type PlayerSymbol = "X" | "O";

export default function TicTacToe() {
  useDocumentTitle("Tic Tac Toe");

  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userSymbol, setUserSymbol] = useState<PlayerSymbol>("X");

  const squaresRef = useRef(squares);
  const xIsNextRef = useRef(xIsNext);

  useEffect(() => {
    squaresRef.current = squares;
    xIsNextRef.current = xIsNext;
  }, [squares, xIsNext]);

  const getBoardState = () => ({
    squares: squaresRef.current,
    xIsNext: xIsNextRef.current,
    winner: calculateWinner(squaresRef.current),
  });

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
  } = useGameSession({ gameId: GAME_ID, getBoardState });

  console.log("Session:", session);

  const { playSound: originalPlaySound } = useGameSound();
  const playSound = (type: string) =>
    soundEnabled && originalPlaySound(type as any);

  useEffect(() => {
    if (session?.board_state) {
      const { squares: s, xIsNext: x } = session.board_state as any;
      if (s) setSquares(s);
      if (x !== undefined) setXIsNext(x);
    } else if (session && !session.board_state) {
      setSquares(Array(9).fill(null));
      setXIsNext(true);
    }
  }, [session]);

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!session || session.status !== "playing" || winner || isDraw) return;

    const isBotTurn =
      (xIsNext && userSymbol === "O") || (!xIsNext && userSymbol === "X");

    if (isBotTurn) {
      const timer = setTimeout(() => {
        const emptyIndices = squares
          .map((val, idx) => (val === null ? idx : null))
          .filter((val) => val !== null) as number[];

        if (emptyIndices.length > 0) {
          const randomIdx =
            emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          handleMove(randomIdx);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, userSymbol, squares, session, winner, isDraw]);

  useEffect(() => {
    if (session?.status === "playing") {
      if (winner) {
        if (winner === userSymbol) {
          playSound("win");
          completeGame(1);
        } else {
          playSound("win");
          completeGame(-1);
        }
      } else if (isDraw) {
        playSound("draw");
        completeGame(0);
      }
    }
  }, [winner, isDraw, session?.status, userSymbol]);

  const handleMove = (i: number) => {
    if (squares[i] || winner || isDraw || session?.status !== "playing") return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    playSound("move");
  };

  const handleUserClick = (i: number) => {
    const isBotTurn =
      (xIsNext && userSymbol === "O") || (!xIsNext && userSymbol === "X");
    if (isBotTurn) return;
    handleMove(i);
  };

  const handleSwitchSide = (symbol: PlayerSymbol) => {
    setUserSymbol(symbol);

    setSquares(Array(9).fill(null));

    setXIsNext(true);

    resetTimer();
  };

  const movesCount = squares.filter((s) => s !== null).length;
  const canSwitchSide =
    session?.status === "playing" &&
    !winner &&
    !isDraw &&
    (movesCount === 0 || (movesCount === 1 && userSymbol === "O"));

  const handleManualSave = () => saveGame(true);
  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

  const handleRestart = async () => {
    setSquares(Array(9).fill(null));

    setXIsNext(true);

    setUserSymbol("X");

    resetTimer();

    await startGame();
  };

  function calculateWinner(squares: SquareValue[]) {
    for (let i = 0; i < WIN_LINES.length; i++) {
      const [a, b, c] = WIN_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse font-medium text-muted-foreground">
          Đang đồng bộ dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <GameHeader />

      {/* Control Bar */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <RoundButton
          onClick={handleManualSave}
          disabled={
            isSaving || !!winner || !!isDraw || session?.status !== "playing"
          }
          variant="primary"
          className="flex items-center gap-2 px-6"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Lưu Game
        </RoundButton>
        <LoadGameDialog
          open={showLoadDialog}
          onOpenChange={setShowLoadDialog}
          sessions={savedSessions}
          currentSessionId={session?.id}
          onLoadSession={loadGame}
          onNewGame={startGame}
        >
          <RoundButton
            variant="neutral"
            className="flex items-center gap-2 px-4"
            onClick={handleOpenSavedGames}
          >
            <Download className="w-4 h-4" /> Tải
          </RoundButton>
        </LoadGameDialog>
      </div>

      {/* Info & Switch Side */}
      <div className="flex items-center gap-6 mb-4">
        <div className="font-mono text-lg font-bold text-primary flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
          <Clock className="w-4 h-4" /> {formatTime(currentPlayTime)}
        </div>

        {/* Nút đổi quân: Hiện nếu game chưa kết thúc và (bàn cờ trống hoặc chỉ có Bot vừa đi) */}
        {canSwitchSide && (
          <div className="flex items-center bg-muted rounded-full p-1 border border-border">
            <button
              onClick={() => handleSwitchSide("X")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                userSymbol === "X"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-3 h-3" /> Cầm X
            </button>
            <button
              onClick={() => handleSwitchSide("O")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                userSymbol === "O"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bot className="w-3 h-3" /> Cầm O
            </button>
          </div>
        )}
      </div>

      {!winner && !isDraw && (
        <div className="mb-2 text-sm text-muted-foreground animate-pulse">
          {(xIsNext && userSymbol === "X") || (!xIsNext && userSymbol === "O")
            ? "Lượt của bạn..."
            : "Máy đang suy nghĩ..."}
        </div>
      )}

      {/* Board Area */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 bg-muted p-3 rounded-2xl shadow-inner border-2 border-border/50">
          {squares.map((square, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUserClick(i)}
              disabled={
                !!square ||
                !!winner ||
                !!isDraw ||
                session?.status !== "playing"
              }
              className={cn(
                "w-20 h-20 md:w-24 md:h-24 bg-surface rounded-xl text-5xl font-extrabold flex items-center justify-center shadow-sm border border-border/20 transition-colors",
                square === "X" && "text-red-500 bg-red-50 dark:bg-red-950/20",
                square === "O" &&
                  "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
                !square && !winner && "hover:bg-accent/10 cursor-pointer"
              )}
            >
              <AnimatePresence>
                {square === "X" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    X
                  </motion.div>
                )}
                {square === "O" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    O
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* End Game Overlay */}
        <AnimatePresence>
          {(winner || isDraw) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-2xl text-center space-y-4 w-[90%]"
              >
                {winner ? (
                  <>
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold">
                      {winner === userSymbol ? "Bạn Thắng!" : "Bạn Thua!"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {winner === userSymbol ? "+1 Điểm" : "-1 Điểm"}
                    </p>
                  </>
                ) : (
                  <>
                    <Minus className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h2 className="text-2xl font-bold">Hòa!</h2>
                    <p className="text-sm text-muted-foreground">+0 Điểm</p>
                  </>
                )}

                <div className="flex gap-2 justify-center pt-2">
                  <RoundButton variant="neutral" onClick={quitGame}>
                    Thoát
                  </RoundButton>
                  <RoundButton variant="primary" onClick={handleRestart}>
                    <RefreshCcw className="w-4 h-4 mr-1" /> Chơi lại
                  </RoundButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-8">
        <RoundButton
          size="small"
          variant="neutral"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </RoundButton>
        <RoundButton
          size="small"
          variant="neutral"
          onClick={quitGame}
          title="Thoát Game"
        >
          <LogOut className="w-5 h-5" />
        </RoundButton>
      </div>
    </div>
  );
}
