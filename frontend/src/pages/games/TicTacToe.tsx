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
  AlertTriangle,
  HelpCircle,
  X,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import { GameHeader } from "@/components/games/GameHeader";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "./LoadGameDialog";

import { getEasyMove, getMediumMove, getHardMove } from "@/lib/AI/tictactoeAI";
import {
  GameSettingsDialog,
  type Difficulty,
} from "@/components/dialogs/GameSettingsDialog";

import { getTimeOptions } from "@/config/gameConfigs";
import formatTime from "@/utils/formatTime";
import { GameComments } from "@/components/comments/GameComments";
import { GameRating } from "@/components/ratings/GameRating";

import { GamePauseControl } from "@/components/games/GamePauseControl";

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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isManualStartRef = useRef(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [isTimeOut, setIsTimeOut] = useState(false);

  const [isManualPaused, setIsManualPaused] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  const isGamePaused = isManualPaused || showInstructions || isSettingsOpen;

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
    isPaused: showInstructions || isManualPaused || isSettingsOpen,
    autoCreate: false,
  });

  console.log("TicTacToe session:", session);

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
      session?.status === "playing" &&
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
      session.status !== "playing" ||
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
    showInstructions,
  ]);

  useEffect(() => {
    if (session?.status === "playing" && !isTimeOut && !showInstructions) {
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
  }, [
    winner,
    isDraw,
    session?.status,
    userSymbol,
    isTimeOut,
    showInstructions,
  ]);

  const handleMove = (i: number) => {
    if (
      squares[i] ||
      winner ||
      isDraw ||
      isTimeOut ||
      session?.status !== "playing" ||
      showInstructions
    )
      return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    playSound("move");
  };

  const handleUserClick = (i: number) => {
    if (isGamePaused || winner || isDraw || isTimeOut) return;
    if (showInstructions) return;

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
    setIsTimeOut(false);
  };

  const handleManualSave = () => saveGame(true);
  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

  const handleRestart = async () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setUserSymbol("X");
    setIsTimeOut(false);
    setShowInstructions(false);
    resetTimer();
    setIsSettingsOpen(true);
  };

  const handleStandardNewGame = async () => {
    setIsSettingsOpen;
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
    session?.status === "playing" &&
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
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 relative">
        <GameHeader />

        {/* Control Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 z-20">
          <RoundButton
            onClick={handleManualSave}
            disabled={
              isSaving ||
              !!winner ||
              !!isDraw ||
              isTimeOut ||
              session?.status !== "playing" ||
              showInstructions
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
          >
            <RoundButton
              variant="neutral"
              className="flex items-center gap-2 px-4"
              onClick={handleOpenSavedGames}
              disabled={showInstructions}
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

          {!winner && !isDraw && !isTimeOut && (
            <GameSettingsDialog
              open={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              currentDifficulty={difficulty}
              currentTimeLimit={timeLimit}
              onSave={handleSaveSettings}
              timeOptions={timeOptions}
              disabled={session?.status !== "playing" || showInstructions}
              preventClose={isInitialSetup}
            />
          )}

          <div className="flex justify-center my-6">
            <GamePauseControl
              isPaused={isManualPaused}
              onTogglePause={() => setIsManualPaused(!isManualPaused)}
              onQuit={quitGame}
              gameName="Tic Tac Toe"
            />
          </div>

          {/* Nút Hướng Dẫn */}
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setShowInstructions(true)}
            title="Hướng dẫn"
            disabled={!!winner || !!isDraw || isTimeOut}
          >
            <HelpCircle className="w-5 h-5" />
          </RoundButton>

          {canSwitchSide && !showInstructions && (
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

        {!winner && !isDraw && !isTimeOut && !showInstructions && (
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
                  session?.status !== "playing" ||
                  showInstructions
                }
                className={cn(
                  "w-20 h-20 md:w-24 md:h-24 bg-surface rounded-xl text-5xl font-extrabold flex items-center justify-center shadow-sm border border-border/20 transition-colors",
                  square === "X" && "text-red-500 bg-red-50 dark:bg-red-950/20",
                  square === "O" &&
                    "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
                  !square &&
                    !winner &&
                    !isTimeOut &&
                    !showInstructions &&
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

          {/* Modal Hướng Dẫn */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl p-4"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-2xl w-full max-w-[320px] relative"
                >
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                      <HelpCircle className="w-6 h-6" /> Hướng dẫn
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm text-left text-foreground/90">
                    <p>
                      <span className="font-bold text-primary">Mục tiêu:</span>{" "}
                      Tạo ra một hàng gồm 3 ký hiệu của bạn (Ngang, Dọc, hoặc
                      Chéo).
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Bạn và Máy sẽ lần lượt đánh vào các ô trống.</li>
                      <li>Người đi trước thường là X.</li>
                      <li>
                        Trò chơi kết thúc khi có người thắng hoặc bàn cờ đầy
                        (Hòa).
                      </li>
                    </ul>
                    <div className="p-2 bg-muted/50 rounded-lg text-xs italic text-center mt-2 border border-border">
                      Game đang tạm dừng...
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <RoundButton
                      onClick={() => setShowInstructions(false)}
                      variant="primary"
                      className="w-full"
                    >
                      Đã hiểu & Tiếp tục
                    </RoundButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End Game Overlay */}
          <AnimatePresence>
            {(winner || isDraw || isTimeOut) && !showInstructions && (
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
                  {isTimeOut ? (
                    <>
                      <AlertTriangle className="w-16 h-16 text-destructive mx-auto animate-bounce" />
                      <h2 className="text-2xl font-bold">Hết giờ!</h2>
                      <p className="text-sm text-muted-foreground">-1 Điểm</p>
                    </>
                  ) : winner ? (
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

        <div className="flex gap-4 mt-8 z-20">
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

      <div className="flex flex-col items-center justify-center">
        <GameRating gameId={GAME_ID} />
        <GameComments gameId={GAME_ID} />
      </div>
    </>
  );
}
