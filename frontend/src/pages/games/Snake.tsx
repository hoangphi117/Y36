import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  Frown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RefreshCcw,
} from "lucide-react";
import { useGameSound } from "@/hooks/useGameSound";

import { GameHeader } from "@/components/games/GameHeader";
import useDocumentTitle from "@/hooks/useDocumentTitle";

// --- CẤU HÌNH GAME ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Đi lên

export default function SnakeGame() {
  useDocumentTitle("Trò Rắn Săn Mồi");
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { playSound } = useGameSound(true);
  const gameLoopRef = useRef<number | null>(null);

  // --- TẠO MỒI NGẪU NHIÊN ---
  const generateFood = useCallback(() => {
    let newFood: { x: number; y: number }; // Khai báo kiểu dữ liệu rõ ràng ở đây
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = snake.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, [snake]);

  // --- LOGIC DI CHUYỂN ---
  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      // 1. Va chạm tường
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        playSound("lose");
        return prevSnake;
      }

      // 2. Tự cắn mình
      if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setIsGameOver(true);
        playSound("lose");
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // 3. Ăn mồi
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood());
        playSound("pop");
      } else {
        newSnake.pop(); // Không ăn mồi thì bỏ đuôi
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, playSound]);

  // --- GAME LOOP ---
  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 150); // Tốc độ rắn
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake]);

  // --- ĐIỀU KHIỂN BÀN PHÍM ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsPaused((prev) => !prev);
        return;
      }
      if (isPaused) return;
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  const resetGame = () => {
    playSound("button");
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    playSound("button1");
    setIsPaused(!isPaused);
  };

  return (
    <>
      <GameHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="flex gap-6 mb-6">
          <div className="text-center bg-white dark:bg-zinc-900 px-6 py-2 rounded-2xl shadow-sm border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Score
            </p>
            <p className="text-xl font-black text-primary">{score}</p>
          </div>

          {/* Nút Tạm dừng / Chơi tiếp */}
          <RoundButton
            size="small"
            variant={isPaused ? "accent" : "neutral"}
            onClick={togglePause}
            disabled={isGameOver}
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </RoundButton>

          <RoundButton size="small" variant="neutral" onClick={resetGame}>
            <RefreshCcw className="w-5 h-5" />
          </RoundButton>
        </div>

        <div className="relative p-2 bg-zinc-800 rounded-[2rem] shadow-xl border-8 border-zinc-700">
          <div
            className="grid bg-[var(--snake-bg)] rounded-2xl relative"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: "min(85vw, 400px)",
              height: "min(85vw, 400px)",
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={i}
                  className="border-[0.5px] border-[var(--snake-grid)]"
                  style={{
                    backgroundColor: isHead
                      ? "var(--snake-head)"
                      : isSnake
                      ? "var(--snake-body)"
                      : isFood
                      ? "var(--snake-food)"
                      : "transparent",
                  }}
                />
              );
            })}

            {/* Hiển thị chữ PAUSED đè lên board khi tạm dừng */}
            <AnimatePresence>
              {isPaused && !isGameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl"
                >
                  <div className="bg-white dark:bg-zinc-900 px-6 py-2 rounded-full shadow-xl border-2 border-primary">
                    <p className="font-black text-primary tracking-widest uppercase">
                      Tạm dừng
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isGameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[1.5rem]"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] text-center shadow-2xl border-4 border-primary"
                >
                  <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-primary mb-6">
                    ÔI TRỜI!
                  </h2>
                  <RoundButton
                    size="medium"
                    variant="primary"
                    onClick={resetGame}
                  >
                    Chơi lại
                  </RoundButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.y === 0 && setDirection({ x: 0, y: -1 })
            }
          >
            <ChevronUp />
          </RoundButton>
          <div />
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.x === 0 && setDirection({ x: -1, y: 0 })
            }
          >
            <ChevronLeft />
          </RoundButton>
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.y === 0 && setDirection({ x: 0, y: 1 })
            }
          >
            <ChevronDown />
          </RoundButton>
          <RoundButton
            size="small"
            variant="neutral"
            onClick={() =>
              !isPaused && direction.x === 0 && setDirection({ x: 1, y: 0 })
            }
          >
            <ChevronRight />
          </RoundButton>
        </div>
      </div>
    </>
  );
}
