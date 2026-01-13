import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Play,
  RefreshCcw, 
  Trophy, 
  Volume2,
  VolumeX
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    setIsGameActive(true);
    playSound("button1");
  }, [boardSize, activeCandies, playSound]);

  const resetToSetup = () => {
    setIsGameActive(false);
    setBoard([]);
    setScore(0);
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
      <GameHeader />
      <div className="text-center my-8 space-y-2">
        <h1 className="text-4xl font-black text-primary uppercase italic drop-shadow-md">
          MATCH 3 COMBO
        </h1>
        {isGameActive && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="text-yellow-500" /> {score}
          </motion.p>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {isGameActive && (
          <div>
            <RoundButton size="small" variant="primary" onClick={startGame}>
              <RefreshCcw className="w-4 h-4 mr-2" /> CHƠI MỚI
            </RoundButton>
          </div>
        )}
        
        <RoundButton
          size="small"
          variant="neutral"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-12 px-0"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </RoundButton>
        {!isGameActive ? (
          <>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-2xl border">
              <span className="text-xs font-bold uppercase opacity-60">Loại kẹo:</span>
              <select 
                className="bg-transparent font-bold outline-none" 
                value={numCandyTypes} 
                onChange={(e) => setNumCandyTypes(Number(e.target.value))}
              >
                {[4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-2xl border">
              <span className="text-xs font-bold uppercase opacity-60">Kích thước:</span>
              <Select value={boardSize.toString()} onValueChange={(v) => setBoardSize(Number(v))}>
                <SelectTrigger className="w-24 border-none shadow-none font-bold h-auto p-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6x6</SelectItem>
                  <SelectItem value="7">7x7</SelectItem>
                  <SelectItem value="8">8x8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <RoundButton size="small" variant="primary" onClick={resetToSetup}>
            <ArrowLeft /> Quay lại
          </RoundButton>
        )}
         
      </div>

      {/* BOARD GAME */}
      <div className="relative p-4 bg-muted/50 rounded-[2.5rem] shadow-2xl border-4 border-primary/20">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {isGameActive ? (
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
                    "w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center relative bg-gradient-to-br from-white/10 to-transparent border border-white/10",
                    selectedSquare === index ? "ring-4 ring-primary z-20" : ""
                  )}
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
            // CONFIG GAME STATUS
            Array.from({ length: boardSize * boardSize }).map((_, i) => (
              <div key={i} className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-dashed border-primary/5 bg-primary/5" />
            ))
          )}
        </div>
        {!isGameActive && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-[2.3rem] p-6 text-center">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-4 opacity-80">Các loại kẹo sẽ xuất hiện:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {activeCandies.map((candy) => (
                  <motion.div 
                    key={candy.id}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="w-12 h-12 bg-card rounded-2xl p-2 shadow-lg border border-primary/20 flex items-center justify-center"
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
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.5)] mb-2 group-hover:bg-primary/90 transition-colors">
                <Play className="w-10 h-10 text-primary-foreground ml-1 fill-current" />
              </div>
              <span className="font-black text-primary text-xl uppercase italic">Bắt đầu ngay</span>
            </motion.button>
          </div>
        )}
      </div>
      <p className="mt-8 text-muted-foreground text-sm font-medium animate-pulse">
        Mẹo: Chọn 2 ô cạnh nhau để tráo đổi vị trí!
      </p>
    </div>
  );
}