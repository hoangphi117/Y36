import { useState, useEffect, useCallback, useRef } from "react";
import { GameInstructions } from "@/components/games/GameInstructions";
import { GameResultOverlay } from "@/components/games/GameResultOverlay";
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import { AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  Upload,
  Download,
  Clock,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import { useGameSound } from "@/hooks/useGameSound";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import {
  GameSettingsDialog,
  type Difficulty,
} from "@/components/dialogs/GameSettingsDialog";
import {
  getBoardSizeOptions,
  getSpeedOptions,
  getIncrementOptions,
} from "@/config/gameConfigs";

import formatTime from "@/utils/formatTime";
import { GameLayout } from "@/components/layouts/GameLayout";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";

const GAME_ID = 3;
const DEFAULT_CONFIG = {
  cols: 20,
  initial_speed: 200,
  speed_increment: 10,
};
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame({ onBack }: { onBack?: () => void }) {
  useDocumentTitle("Trò Rắn Săn Mồi");

  const [gridSize, setGridSize] = useState(DEFAULT_CONFIG.cols);
  const [currentSpeed, setCurrentSpeed] = useState(
    DEFAULT_CONFIG.initial_speed,
  );
  const [speedIncrement, setSpeedIncrement] = useState(
    DEFAULT_CONFIG.speed_increment,
  );

  const ignoreConfigSyncRef = useRef(false);

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const scoreRef = useRef(score);
  const speedRef = useRef(currentSpeed);
  const gameOverRef = useRef(isGameOver);

  useEffect(() => {
    snakeRef.current = snake;
    foodRef.current = food;
    directionRef.current = direction;
    scoreRef.current = score;
    speedRef.current = currentSpeed;
    gameOverRef.current = isGameOver;
  }, [snake, food, direction, score, currentSpeed, isGameOver]);

  const { playSound: originalPlaySound } = useGameSound(true);
  const playSound = useCallback(
    (type: string) => {
      if (soundEnabled) originalPlaySound(type as any);
    },
    [soundEnabled, originalPlaySound],
  );

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const boardSizeOptions = getBoardSizeOptions(GAME_ID);
  const speedOptions = getSpeedOptions(GAME_ID);
  const incrementOptions = getIncrementOptions(GAME_ID);

  const getBoardState = useCallback(
    () => ({
      snake: snakeRef.current,
      food: foodRef.current,
      direction: directionRef.current,
      score: scoreRef.current,
      speed: speedRef.current,
      isGameOver: gameOverRef.current,
      gridSize,
    }),
    [gridSize],
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
  } = useGameSession({
    gameId: GAME_ID,
    getBoardState,
    isPaused: isPaused || isSettingsOpen,
    autoCreate: false,
    onQuit: onBack,
  });

  useEffect(() => {
    if (!isLoading && !session && !showLoadDialog) {
      setIsSettingsOpen(true);
      setIsPaused(true);
    }
  }, [isLoading, session, showLoadDialog]);

  useEffect(() => {
    if (session) {
      if (session.session_config) {
        if (!ignoreConfigSyncRef.current) {
          const config = session.session_config;
          if (config.cols) setGridSize(Number(config.cols));
          if (config.speed_increment)
            setSpeedIncrement(Number(config.speed_increment));
          if (!session.board_state && config.initial_speed) {
            setCurrentSpeed(Number(config.initial_speed));
          }
        }
      }

      if (session.board_state) {
        const state = session.board_state as any;
        if (state.gridSize) setGridSize(state.gridSize);
        if (state.snake) setSnake(state.snake);
        if (state.food) setFood(state.food);
        if (state.direction) setDirection(state.direction);
        if (state.score !== undefined) setScore(state.score);
        if (state.speed) setCurrentSpeed(state.speed);

        setIsGameOver(false);
        setIsPaused(true);
      } else {
        const center = Math.floor(gridSize / 2);
        setSnake([
          { x: center, y: center },
          { x: center, y: center + 1 },
          { x: center, y: center + 2 },
        ]);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setIsGameOver(false);
        setIsPaused(false);

        setFood({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        });
      }
    }
  }, [session]);

  const generateFood = useCallback(() => {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      const isOnSnake = snake.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y,
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, [snake, gridSize]);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
    playSound("lose");
    if (session?.status === "playing" || session?.status === "saved") {
      completeGame(scoreRef.current);
    }
  }, [session?.status, completeGame, playSound]);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused || !session || (session.status !== "playing" && session.status !== "saved"))
      return;

    setSnake((prevSnake) => {
      const head = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
      ) {
        handleGameOver();
        return prevSnake;
      }

      if (prevSnake.some((seg) => seg.x === head.x && head.y === seg.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood());
        playSound("pop");
        if (speedIncrement > 0) {
          setCurrentSpeed((prev) => Math.max(50, prev - speedIncrement));
        }
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [
    direction,
    food,
    generateFood,
    isGameOver,
    isPaused,
    gridSize,
    session,
    handleGameOver,
    playSound,
    speedIncrement,
  ]);

  useEffect(() => {
    if (
      (session?.status === "playing" || session?.status === "saved") &&
      !isGameOver &&
      !isPaused &&
      !isSettingsOpen
    ) {
      gameLoopRef.current = setInterval(moveSnake, currentSpeed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [
    moveSnake,
    currentSpeed,
    isPaused,
    isSettingsOpen,
    isGameOver,
    session?.status,
  ]);

  const handleRestart = async () => {
    ignoreConfigSyncRef.current = true;
    await startGame();
  };

  const handleStandardNewGame = async () => {
    setIsSettingsOpen(true);
    setIsPaused(true);
  };

  const handleSaveSettings = (
    _diff: Difficulty,
    _time: number,
    _turn: number,
    newBoardSize: number,
    newSpeed: number,
    newIncrement: number,
  ) => {
    setGridSize(newBoardSize);
    setCurrentSpeed(newSpeed);
    setSpeedIncrement(newIncrement);

    const newConfig = {
      cols: newBoardSize,
      rows: newBoardSize,
      initial_speed: newSpeed,
      speed_increment: newIncrement,
    };

    ignoreConfigSyncRef.current = true;

    startGame(newConfig);

    setIsSettingsOpen(false);
    setIsPaused(false);

    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
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

  const handleSaveAndExit = async () => {
    setIsPaused(false);
    await saveGame(true);
    if (onBack) onBack();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }
      if (isPaused || isGameOver) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, isPaused, isGameOver]);

  const isInitialSetup =
    (!session || (session.play_time_seconds === 0 && !session.board_state)) &&
    isSettingsOpen;

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <GameLayout gameId={GAME_ID}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        {/* HEADER REMOVED */}
        
        {/* INFO */}
        <div className="flex justify-between items-center w-full max-w-md px-4 py-2 mb-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-xl">{score}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-mono bg-primary/10 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" /> {formatTime(currentPlayTime)}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
          <RoundButton
            onClick={handleManualSave}
            disabled={isSaving || isGameOver || (session?.status !== "playing" && session?.status !== "saved")}
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
            onNewGame={handleStandardNewGame}
            onBack={onBack}
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

          <GameInstructions gameType="snake" />

          {/* Settings Button */}
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt"
            disabled={isGameOver}
          >
            <Settings className="w-4 h-4" />
          </RoundButton>

          <RoundButton
            size="small"
            variant={isPaused ? "accent" : "neutral"}
            onClick={() => setIsPaused(!isPaused)}
            disabled={isGameOver}
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </RoundButton>
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

        </div>

        {/* BOARD */}
        <div className="relative p-2 bg-zinc-800 rounded-[1.5rem] shadow-xl border-8 border-zinc-700">
          <div
            className="grid bg-[var(--snake-bg)] rounded-xl relative overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: "min(90vw, 400px)",
              height: "min(90vw, 400px)",
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const x = i % gridSize;
              const y = Math.floor(i / gridSize);
              const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;
              return (
                <div
                  key={i}
                  className="border-[0.5px] border-[var(--snake-grid)]/10"
                  style={{
                    backgroundColor: isHead
                      ? "var(--snake-head)"
                      : isSnake
                        ? "var(--snake-body)"
                        : isFood
                          ? "var(--snake-food)"
                          : "transparent",
                    borderRadius: isSnake ? "4px" : "0",
                  }}
                />
              );
            })}

            <AnimatePresence>
              {isGameOver && (
                <GameResultOverlay
                  status="lose"
                  gameType="snake"
                  score={score}
                  onRestart={handleRestart}
                  onQuit={quitGame}
                  playTime={currentPlayTime}
                />
              )}
            </AnimatePresence>

            {/* Settings Dialog (inline mode) */}
            {!isGameOver && (
              <GameSettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                currentBoardSize={gridSize}
                currentSpeed={currentSpeed}
                currentIncrement={speedIncrement}
                boardSizeOptions={boardSizeOptions}
                speedOptions={speedOptions}
                incrementOptions={incrementOptions}
                onSave={handleSaveSettings}
                disabled={session?.status !== "playing" && session?.status !== "saved"}
                preventClose={isInitialSetup}
                inline
              />
            )}
          </div>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <RoundButton
            size="medium"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.y === 0 && setDirection({ x: 0, y: -1 })
            }
          >
            <ChevronUp className="w-6 h-6" />
          </RoundButton>
          <div />
          <RoundButton
            size="medium"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.x === 0 && setDirection({ x: -1, y: 0 })
            }
          >
            <ChevronLeft className="w-6 h-6" />
          </RoundButton>
          <RoundButton
            size="medium"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.y === 0 && setDirection({ x: 0, y: 1 })
            }
          >
            <ChevronDown className="w-6 h-6" />
          </RoundButton>
          <RoundButton
            size="medium"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.x === 0 && setDirection({ x: 1, y: 0 })
            }
          >
            <ChevronRight className="w-6 h-6" />
          </RoundButton>
        </div>
      </div>

      {/* Pause Menu */}
      {isPaused && !isGameOver && !isSettingsOpen && session && (
        <PauseMenu
          onContinue={() => setIsPaused(false)}
          onSaveAndExit={handleSaveAndExit}
          onRestart={handleRestart}
        />
      )}
    </GameLayout>
  );
}
