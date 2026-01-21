import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Clock,
  User,
  Settings,
  Bot,
  Play,
  Pause,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";
import { GameInstructions } from "@/components/games/GameInstructions";
import { GameResultOverlay } from "@/components/games/GameResultOverlay";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { PauseMenu } from "@/components/games/memory/PauseMenu";

import { getEasyMove, getMediumMove, getHardMove } from "@/lib/AI/tictactoeAI";
import {
  GameSettingsDialog,
  type Difficulty,
} from "@/components/dialogs/GameSettingsDialog";

import { getTimeOptions } from "@/config/gameConfigs";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";
import formatTime from "@/utils/formatTime";
import { GameLayout } from "@/components/layouts/GameLayout";

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

export default function TicTacToe({ onBack }: { onBack?: () => void }) {
  useDocumentTitle("Tic Tac Toe");

  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userSymbol, setUserSymbol] = useState<PlayerSymbol>("X");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isManualStartRef = useRef(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [isTimeOut, setIsTimeOut] = useState(false);

  const [isManualPaused, setIsManualPaused] = useState(false);

  const isGamePaused = isManualPaused || isSettingsOpen;

  const ignoreConfigSyncRef = useRef(false);
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
  } = useGameSession({
    gameId: GAME_ID,
    getBoardState,
    isPaused: isManualPaused || isSettingsOpen,
    autoCreate: false,
    onQuit: onBack,
  });

  const timeOptions = getTimeOptions(GAME_ID);
  const { playSound: originalPlaySound } = useGameSound();
  const playSound = (type: string) =>
    soundEnabled && originalPlaySound(type as any);

  useEffect(() => {
    if (!isLoading && !session && !showLoadDialog) {
      setIsSettingsOpen(true);
    }
  }, [isLoading, session, showLoadDialog]);

  useEffect(() => {
    if (session) {
      if (session.board_state) {
        const { squares: s, xIsNext: x } = session.board_state as any;
        if (s) setSquares(s);
        if (x !== undefined) setXIsNext(x);
      } else {
        setSquares(Array(9).fill(null));
        setXIsNext(true);
      }

      if (session.session_config?.time_limit) {
        if (ignoreConfigSyncRef.current) {
          ignoreConfigSyncRef.current = false;
        } else {
          setTimeLimit(Number(session.session_config.time_limit));
        }
      }
    }
  }, [session]);

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  useEffect(() => {
    if (
      timeLimit > 0 &&
      (session?.status === "playing" || session?.status === "saved") &&
      currentPlayTime >= timeLimit &&
      !winner &&
      !isDraw &&
      !isTimeOut
    ) {
      setIsTimeOut(true);
      playSound("lose");
      completeGame(-1);
    }
  }, [currentPlayTime, timeLimit, session?.status, winner, isDraw, isTimeOut]);

  useEffect(() => {
    if (
      !session ||
      session.status !== "playing" && session.status !== "saved" ||
      winner ||
      isDraw ||
      isTimeOut ||
      isGamePaused
    )
      return;

    const isBotTurn =
      (xIsNext && userSymbol === "O") || (!xIsNext && userSymbol === "X");

    if (isBotTurn) {
      const timer = setTimeout(() => {
        let moveIndex = -1;
        const botSymbol = userSymbol === "X" ? "O" : "X";

        if (difficulty === "easy") {
          moveIndex = getEasyMove(squares);
        } else if (difficulty === "medium") {
          moveIndex = getMediumMove(squares, botSymbol);
        } else {
          moveIndex = getHardMove(squares, botSymbol);
        }

        if (moveIndex !== -1) {
          handleMove(moveIndex);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    xIsNext,
    userSymbol,
    squares,
    session,
    winner,
    isDraw,
    isTimeOut,
    difficulty,
    isGamePaused,
  ]);

  useEffect(() => {
    if ((session?.status === "playing" || session?.status === "saved") && !isTimeOut) {
      if (winner) {
        if (winner === userSymbol) {
          playSound("win");
          completeGame(1);
        } else {
          playSound("lose");
          completeGame(-1);
        }
      } else if (isDraw) {
        playSound("draw");
        completeGame(0);
      }
    }
  }, [
    winner,
    isDraw,
    session?.status,
    userSymbol,
    isTimeOut,
  ]);

  const handleMove = (i: number) => {
    if (
      squares[i] ||
      winner ||
      isDraw ||
      isTimeOut ||
      isTimeOut ||
      (session?.status !== "playing" && session?.status !== "saved")
    )
      return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    playSound("pop");
  };

  const handleUserClick = (i: number) => {
    if (isGamePaused || winner || isDraw || isTimeOut) return;

    const isBotTurn =
      (xIsNext && userSymbol === "O") || (!xIsNext && userSymbol === "X");
    if (isBotTurn) return;
    handleMove(i);
  };

  const handleSwitchSide = (symbol: PlayerSymbol) => {
    playSound("button");
    setUserSymbol(symbol);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    resetTimer();
    setIsTimeOut(false);
  };

  const handleManualSave = () => saveGame(true);
  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

  const handleDeleteGame = async (sessionId: string) => {
    try {
      await axiosClient.delete(`/sessions/${sessionId}`);
      await fetchSavedSessions();
      toast.success("Đã xóa ván chơi!");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Xóa thất bại");
    }
  };

  const handleRestart = async () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setUserSymbol("X");
    setIsTimeOut(false);
    setIsManualPaused(false);
    resetTimer();
    setIsSettingsOpen(true);
  };

  const handleStandardNewGame = async () => {
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = (
    newDifficulty: Difficulty,
    newTimeLimit: number,
  ) => {
    setDifficulty(newDifficulty);
    setTimeLimit(newTimeLimit);

    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setIsTimeOut(false);
    resetTimer();

    ignoreConfigSyncRef.current = true;
    isManualStartRef.current = true;

    const newConfig = { time_limit: newTimeLimit };
    startGame(newConfig);

    setIsSettingsOpen(false);
  };

  const handleSaveAndExit = async () => {
    setIsManualPaused(false);
    try {
      await saveGame(true);
      if (onBack) onBack();
    } catch (error) {
      console.error("Save failed:", error);
      if (onBack) onBack();
    }
  };

  function calculateWinner(squares: SquareValue[]) {
    for (let i = 0; i < WIN_LINES.length; i++) {
      const [a, b, c] = WIN_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }
    return null;
  }

  const movesCount = squares.filter((s) => s !== null).length;
  const canSwitchSide =
    (session?.status === "playing" || session?.status === "saved") &&
    !winner &&
    !isDraw &&
    !isTimeOut &&
    (movesCount === 0 || (movesCount === 1 && userSymbol === "O"));

  const isInitialSetup =
    (!session || (session.play_time_seconds === 0 && !session.board_state)) &&
    isSettingsOpen;

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
    <GameLayout gameId={GAME_ID}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-2 relative">
        
        {/* HEADER REMOVED */}

        {/* Control Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 z-20">
          <RoundButton
            onClick={handleManualSave}
            disabled={
              isSaving ||
              !!winner ||
              !!isDraw ||
              isTimeOut ||
              isTimeOut ||
              (session?.status !== "playing" && session?.status !== "saved")
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
            onNewGame={handleStandardNewGame}
            onDeleteSession={handleDeleteGame}
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

        {/* Info & Settings & Help */}
        <div className="flex items-center gap-4 mb-4 z-20">
          <div
            className={cn(
              "font-mono text-lg font-bold flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors",
              timeLimit > 0 && currentPlayTime > timeLimit * 0.8
                ? "bg-red-100 text-red-600 border-red-300 animate-pulse"
                : "bg-primary/10 text-primary border-primary/20",
            )}
          >
            {/* Sử dụng trực tiếp currentPlayTime vì nó đã tự động pause */}
            <Clock className="w-4 h-4" />
            {formatTime(currentPlayTime)}
            {timeLimit > 0 && (
              <span className="text-xs opacity-70">
                / {formatTime(timeLimit)}
              </span>
            )}
          </div>

          {/* Nút Hướng Dẫn */}
          <GameInstructions gameType="tictactoe" />
          
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

          {/* Nút Cài Đặt */}
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt"
            disabled={!!winner || !!isDraw || isTimeOut}
          >
            <Settings className="w-5 h-5" />
          </RoundButton>

          {/* Pause Button */}
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setIsManualPaused(!isManualPaused)}
            disabled={!!winner || !!isDraw || isTimeOut}
            title={isManualPaused ? "Tiếp tục" : "Tạm dừng"}
          >
            {isManualPaused ? (
              <Play className="w-5 h-5 fill-current" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </RoundButton>

          {canSwitchSide && (
            <div className="flex items-center bg-muted rounded-full p-1 border border-border">
              <button
                onClick={() => handleSwitchSide("X")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                  userSymbol === "X"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleSwitchSide("O")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                  userSymbol === "O"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Bot className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {!winner && !isDraw && !isTimeOut && (
          <div className="mb-2 text-sm text-muted-foreground animate-pulse">
            {(xIsNext && userSymbol === "X") || (!xIsNext && userSymbol === "O")
              ? "Lượt của bạn..."
              : `Máy (${difficulty}) đang nghĩ...`}
          </div>
        )}

        {/* Board Area */}
        <div className="relative z-10">
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
                  isTimeOut ||
                  isTimeOut ||
                  (session?.status !== "playing" && session?.status !== "saved")
                }
                className={cn(
                  "w-20 h-20 md:w-24 md:h-24 bg-surface rounded-xl text-5xl font-extrabold flex items-center justify-center shadow-sm border border-border/20 transition-colors",
                  square === "X" && "text-red-500 bg-red-50 dark:bg-red-950/20",
                  square === "O" &&
                    "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
                  !square &&
                    !winner &&
                    !isTimeOut &&
                    "hover:bg-accent/10 cursor-pointer",
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
            {(winner || isDraw || isTimeOut) && (
              <GameResultOverlay
                status={
                  isTimeOut
                    ? "timeout"
                    : winner === userSymbol
                      ? "win"
                      : winner
                        ? "lose"
                        : "draw"
                }
                winner={winner === userSymbol ? "user" : "bot"}
                gameType="tictactoe"
                onRestart={handleRestart}
                onQuit={quitGame}
                playTime={currentPlayTime}
              />
            )}
          </AnimatePresence>

          {/* Settings Dialog (inline mode) */}
          {!winner && !isDraw && !isTimeOut && (
            <GameSettingsDialog
              open={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              currentDifficulty={difficulty}
              currentTimeLimit={timeLimit}
              onSave={handleSaveSettings}
              timeOptions={timeOptions}
              disabled={session?.status !== "playing" && session?.status !== "saved"}
              preventClose={isInitialSetup}
              inline
            />
          )}
        </div>

        {/* Pause Menu */}
        {isManualPaused && !winner && !isDraw && !isTimeOut && (
          <PauseMenu
            onContinue={() => setIsManualPaused(false)}
            onSaveAndExit={handleSaveAndExit}
            onRestart={handleRestart}
          />
        )}
      </div>
    </GameLayout>
  );
}
