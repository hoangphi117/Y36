import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Play,
  RefreshCcw, 
  Settings2, 
  Trophy, 
  Volume2,
  VolumeX,
  Pause,
  PlayCircle,
  Clock,
  Target,
  Candy,
  Check
} from "lucide-react";

import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";
import { useGameSound } from "@/hooks/useGameSound";
import { GameHeader } from "@/components/games/GameHeader";
import icon1 from "@/assets/candyIcons/candyOne.png";
import icon2 from "@/assets/candyIcons/candyTwo.png";
import icon3 from "@/assets/candyIcons/candyThree.png";
import icon4 from "@/assets/candyIcons/candyFour.png";
import icon5 from "@/assets/candyIcons/candyFive.png";
import icon6 from "@/assets/candyIcons/candySix.png";
import icon7 from "@/assets/candyIcons/candySeven.png";
import icon8 from "@/assets/candyIcons/candyEight.png";
import iceBorder from "@/assets/candyIcons/iceBorder.png"


const BOARD_SIZE = 6;
const CANDY_TYPES = [
  { icon: icon1, id: "1" },
  { icon: icon2, id: "2" },
  { icon: icon3, id: "3" },
  { icon: icon4, id: "4" },
  { icon: icon5, id: "5" },
  { icon: icon6, id: "6" },
  { icon: icon7, id: "7" },
  { icon: icon8, id: "8" },
];

const NUM_TYPES = 6;

export default function Match3Game() {
  const [board, setBoard] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useGameSound(soundEnabled);
  const [numCandyTypes, setNumCandyTypes] = useState(NUM_TYPES);
  const [isGameActive, setIsGameActive] = useState(false);
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);
  
  // New states for game modes and features
  const [gameMode, setGameMode] = useState<"time" | "rounds" | "endless">("time");
  const [timeLimit, setTimeLimit] = useState(30); // seconds
  const [targetMatches, setTargetMatches] = useState(10);
  const [matchesCount, setMatchesCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");

  const activeCandies = useMemo(() => CANDY_TYPES.slice(0, numCandyTypes), [numCandyTypes]);

  // create board
  const startGame = useCallback(() => {
    const randomBoard: string[] = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
      const row = Math.floor(i / boardSize);
      const col = i % boardSize;

      const validTypes = activeCandies.filter(type => {
        if (col >= 2 && randomBoard[i - 1] === type.id && randomBoard[i - 2] === type.id) 
          return false;
        if (row >= 2 && randomBoard[i - boardSize] === type.id && randomBoard[i - (boardSize * 2)] === type.id) 
          return false;
        return true;
      });

      const randomType = validTypes[Math.floor(Math.random() * validTypes.length)];
      randomBoard.push(randomType.id);
    }
    setBoard(randomBoard);
    setScore(0);
    setMatchesCount(0);
    setTimeRemaining(timeLimit);
    setIsGameActive(true);
    setIsPaused(false);
    setShowGameOver(false);
    playSound("button1");
  }, [boardSize, activeCandies, playSound, timeLimit]);

  const resetToSetup = () => {
    setIsGameActive(false);
    setBoard([]);
    setScore(0);
    setMatchesCount(0);
    setIsPaused(false);
    setShowGameOver(false);
  }

  // check match 3, 4, 5
  const checkForMatches = useCallback(() => {
    if(!isGameActive) return;

    const newBoard = [...board];
    let foundMatch = false;

    // Check row
    for (let i = 0; i < boardSize * boardSize; i++) {
      if (i % boardSize < boardSize - 2) {
        const match = [i, i + 1, i + 2];
        const color = board[i];
        if (color && match.every(idx => board[idx] === color)) {
          match.forEach(idx => (newBoard[idx] = ""));
          foundMatch = true;
        }
      }
    }

    // Check col
    for (let i = 0; i < boardSize * boardSize; i++) {
      const match = [i, i + boardSize, i + boardSize * 2];
      const color = board[i];
      if (color && match.every(idx => board[idx] === color)) {
        match.forEach(idx => (newBoard[idx] = ""));
        foundMatch = true;
      }
    }

    if (foundMatch) {
      const emptyCount = newBoard.filter(cell => cell === "").length;
      setScore(prev => prev + emptyCount * 10);
      setMatchesCount(prev => prev + 1);
      setBoard(newBoard);
      playSound("pop");
    }
    return foundMatch;
  }, [board, boardSize, isGameActive, playSound]);

  // handle move into square below
  const moveIntoSquareBelow = useCallback(() => {
    if(!isGameActive) return;

    const newBoard = [...board];
    let moved = false;

    for (let i = 0; i <= boardSize * (boardSize - 1) - 1; i++) {
        const isFirstRow = i < boardSize;

        if (isFirstRow && newBoard[i] === "") {
          const randomIndex = Math.floor(Math.random() * activeCandies.length);
          newBoard[i] = activeCandies[randomIndex].id;
          moved = true;
          }

        if (newBoard[i + boardSize] === "") {
            newBoard[i + boardSize] = newBoard[i];
            newBoard[i] = "";
            moved = true;
        }
    }

    if (moved) setBoard(newBoard);
  }, [board, boardSize, isGameActive, activeCandies]); 

  useEffect(() => {
    if (!isGameActive) return;
    
    const timer = setInterval(() => {
      const matched = checkForMatches();
      if (!matched) {
        moveIntoSquareBelow();
      }
    }, 150);
    return () => clearInterval(timer);
  }, [checkForMatches, moveIntoSquareBelow, isGameActive]);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || isPaused || gameMode === "endless") return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsGameActive(false);
          setShowGameOver(true);
          setGameOverReason(`Hết giờ! Điểm của bạn: ${score}`);
          playSound("lose");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isPaused, gameMode, score, playSound]);

  // Check for target matches
  useEffect(() => {
    if (gameMode === "rounds" && matchesCount >= targetMatches && isGameActive) {
      setIsGameActive(false);
      setShowGameOver(true);
      setGameOverReason(`Hoàn thành ${targetMatches} lần ghép! Điểm: ${score}`);
      playSound("win");
    }
  }, [matchesCount, targetMatches, gameMode, isGameActive, score, playSound]);

  // handle swap
  const handleSquareClick = (idx: number) => {
    if (selectedSquare === null) {
      setSelectedSquare(idx);
    } else {
      const col1 = selectedSquare % boardSize;
      const col2 = idx % boardSize;
      const row1 = Math.floor(selectedSquare / boardSize);
      const row2 = Math.floor(idx / boardSize);

      const isAdjacent = Math.abs(col1 - col2) + Math.abs(row1 - row2) === 1;

      if (isAdjacent) {
        const newBoard = [...board];
        const temp = newBoard[selectedSquare];
        newBoard[selectedSquare] = newBoard[idx];
        newBoard[idx] = temp;
        setBoard(newBoard);
        playSound("button1");
      }
      setSelectedSquare(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground pb-10">
      <div className="z-20">
        <GameHeader />
      </div>
      <div className="text-center my-8 space-y-2">
        <h1 className="text-4xl font-black text-primary uppercase italic drop-shadow-md">
          MATCH 3 COMBO
        </h1>
        {isGameActive && (
          <motion.div className="flex items-center gap-4 justify-center text-2xl font-bold">
            <motion.p key={score} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <Trophy className="text-yellow-500" /> {score}
            </motion.p>
            
            {gameMode === "time" && (
              <motion.p 
                key={timeRemaining}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl",
                  timeRemaining < 30 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                )}
              >
                <Clock className="w-5 h-5" /> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </motion.p>
            )}
            
            {gameMode === "rounds" && (
              <motion.p key={matchesCount} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent">
                <Target className="w-5 h-5" /> {matchesCount}/{targetMatches}
              </motion.p>
            )}
          </motion.div>
        )}
      </div>

      {/* Controls and Settings Section */}
      <div className="w-full max-w-6xl px-4 mb-8">
        {/* Game Active Controls */}
        {isGameActive && (
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <RoundButton size="small" variant="primary" onClick={startGame}>
              <RefreshCcw className="w-4 h-4 mr-2" /> MỚI
            </RoundButton>
            <RoundButton 
              size="small" 
              variant="accent" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" /> TIẾP TỤC
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" /> TẠM DỪNG
                </>
              )}
            </RoundButton>
            <RoundButton
              size="small"
              variant="neutral"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 px-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </RoundButton>
          </div>
        )}

        {/* Settings Section */}
        {!isGameActive && (
          <div className="space-y-4">
            {/* Game Mode Selection */}
            <div className="bg-muted/40 backdrop-blur-sm rounded-xl border border-primary/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-black uppercase">
                <Settings2 className="w-5 h-5" />
                <span>Chế độ chơi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                  <input 
                    type="radio" 
                    name="gameMode" 
                    value="endless" 
                    checked={gameMode === "endless"}
                    onChange={(e) => setGameMode(e.target.value as "endless")}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Chơi tự do</p>
                    <p className="text-xs opacity-60">Không giới hạn</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                  <input 
                    type="radio" 
                    name="gameMode" 
                    value="time" 
                    checked={gameMode === "time"}
                    onChange={(e) => setGameMode(e.target.value as "time")}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Chơi theo thời gian</p>
                    <p className="text-xs opacity-60">Ghi điểm cao nhất</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                  <input 
                    type="radio" 
                    name="gameMode" 
                    value="rounds" 
                    checked={gameMode === "rounds"}
                    onChange={(e) => setGameMode(e.target.value as "rounds")}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Chơi theo lần ghép</p>
                    <p className="text-xs opacity-60">Hoàn thành mục tiêu</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Time and Rounds Settings - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Time Settings */}
              {gameMode === "time" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5"
                >
                  <div className="flex items-center gap-2 text-primary font-black uppercase mb-4 text-sm">
                    <Clock className="w-4 h-4" />
                    Thời gian
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 180].map((time) => (
                      <button
                        key={time}
                        onClick={() => setTimeLimit(time)}
                        className={cn(
                          "py-3 px-2 rounded-lg font-bold text-sm transition-all border",
                          timeLimit === time
                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                            : "bg-muted border-primary/20 hover:bg-muted/80"
                        )}
                      >
                        {time === 30 ? "30 giây" : time === 60 ? "1 phút" : "3 phút"}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rounds Settings */}
              {gameMode === "rounds" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5"
                >
                  <div className="flex items-center gap-2 text-primary font-black uppercase mb-4 text-sm">
                    <Target className="w-4 h-4" />
                    Lần ghép mục tiêu
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20].map((rounds) => (
                      <button
                        key={rounds}
                        onClick={() => setTargetMatches(rounds)}
                        className={cn(
                          "py-3 px-2 rounded-lg font-bold text-sm transition-all border",
                          targetMatches === rounds
                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                            : "bg-muted border-primary/20 hover:bg-muted/80"
                        )}
                      >
                        {rounds}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Board Settings */}
              <div className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5 space-y-4">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-sm">
                  <Trophy className="w-4 h-4" />
                  Cài đặt bảng
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black uppercase opacity-60 tracking-widest">
                      LOẠI KẸO
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[5, 6, 7, 8].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNumCandyTypes(n)}
                          className={cn(
                            "w-9 h-9 rounded-xl font-black text-sm transition-all border-b-2",
                            numCandyTypes === n 
                              ? "bg-primary text-primary-foreground border-primary-700 shadow-md" 
                              : "bg-background text-muted-foreground border-2"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 tracking-widest">
                      Kích thước bàn
                    </label>
                    <div className="flex gap-2">
                      {[6, 7, 8].map((s) => (
                        <button
                          key={s}
                          onClick={() => setBoardSize(s)}
                          className={cn(
                            "flex-1 h-12 rounded-2xl font-black transition-all border-b-4 relative overflow-hidden",
                            boardSize === s 
                              ? "bg-primary text-primary-foreground border-primary-700 shadow-lg" 
                              : "bg-background text-muted-foreground border-2 hover:border-primary/30"
                          )}
                        >
                          {s}x{s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex justify-center">
              <RoundButton
                size="small"
                variant="neutral"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-12 px-0"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </RoundButton>
            </div>
          </div>
        )}
      </div>

      {/* BOARD GAME */}
      <div className="relative w-full max-w-xl px-4 mb-8">
        <div className="relative p-4 bg-muted/50 rounded-[2.5rem] shadow-2xl border-4 border-primary/20 w-full flex justify-center">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
          >
          {isGameActive && !isPaused ? (
            // PLAYING STATUS
            board.map((typeId, index) => {
              const type = CANDY_TYPES.find(t => t.id === typeId);
              return (
                <motion.button
                  key={`${index}-${typeId}`}
                  layout
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSquareClick(index)}
                  className={cn(
                    "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative bg-linear-to-br from-white/10 to-transparent border border-white/10",
                    selectedSquare === index ? "ring-4 ring-primary z-20" : ""
                  )}
                  style={{
                    backgroundImage: `url(${iceBorder})`,
                  }}
                >
                  <AnimatePresence>
                    {type && (
                      <motion.img 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                        src={type.icon} className="w-4/5 h-4/5 object-contain" 
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })
          ) : (
            // CONFIG GAME STATUS or PAUSED STATUS
            Array.from({ length: boardSize * boardSize }).map((_, i) => (
              <div 
                key={i} 
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-dashed border-primary"
                style={{
                  backgroundImage: `url(${iceBorder})`,
                }}
              />
            ))
          )}
        </div>

        {/* Setup screen overlay */}
        {!isGameActive && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-[2.3rem] p-4 sm:p-6 text-center">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary mb-3 sm:mb-4 opacity-80">Các loại kẹo sẽ xuất hiện:</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {activeCandies.map((candy) => (
                  <motion.div 
                    key={candy.id}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-2xl p-2 shadow-lg border border-primary/20 flex items-center justify-center"
                  >
                    <img src={candy.icon} className="w-full h-full object-contain" alt="candy" />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="group relative flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.5)] mb-2 group-hover:bg-primary/90 transition-colors">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1 fill-current" />
              </div>
              <span className="font-black text-primary text-lg sm:text-xl uppercase italic">Bắt đầu ngay</span>
            </motion.button>
          </div>
        )}

        {/* Pause overlay */}
        {isGameActive && isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2.3rem] p-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-6"
              >
                <Pause className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-2xl font-black uppercase text-primary">Tạm dừng</p>
              </motion.div>
              
              <RoundButton 
                size="small" 
                variant="danger"
                onClick={resetToSetup}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại cài đặt
              </RoundButton>
            </div>
          </motion.div>
        )}

        {/* Game Over Modal */}
        {showGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-[2.3rem] p-6"
          >
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <p className="text-3xl font-black uppercase text-primary mb-4">Kết thúc trò chơi!</p>
              <p className="text-lg text-foreground mb-6 font-semibold">{gameOverReason}</p>
              
              <div className="flex gap-3 justify-center flex-wrap">
                <RoundButton 
                  size="small" 
                  variant="primary"
                  onClick={startGame}
                >
                  <Play className="w-4 h-4 mr-2" /> Chơi lại
                </RoundButton>
                <RoundButton 
                  size="small" 
                  variant="neutral"
                  onClick={resetToSetup}
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Cài đặt
                </RoundButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      </div>

      {!isGameActive && !showGameOver && (
        <div className="mt-8 px-4 max-w-2xl">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              💡 Mẹo: Chọn 2 ô cạnh nhau để tráo đổi vị trí!
            </p>
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              {gameMode === "time" ? "⏱️ Đặt thời gian và cố gắng ghi điểm cao nhất" : gameMode === "rounds" ? "🎯 Hoàn thành số lần ghép đã đặt" : "∞ Chơi thoải mái không giới hạn"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}