import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCcw, 
  Trophy, 
  Volume2,
  VolumeX
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
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

  // 1. Khởi tạo board
  const createBoard = useCallback(() => {
    const randomBoard: string[] = [];

    for (let i = 0; i < boardSize * boardSize; i++) {
        const row = Math.floor(i / boardSize);
        const col = i % boardSize;

        const validTypes = CANDY_TYPES.slice(0, numCandyTypes).filter(type => {
            // check col
            if(col >= 2) {
                if(randomBoard[i - 1] === type.id && randomBoard[i - 2] === type.id ) {
                    return false;
                }
            }

            // check row
            if(row >= 2) {
                if(randomBoard[i - boardSize] === type.id && randomBoard[i - (boardSize * 2)] === type.id) {
                    return false;
                }
            }

            return true;
        })

        // get random type in vaidTypes array
        const randomType = validTypes[Math.floor(Math.random() * validTypes.length)];
        randomBoard.push(randomType.id);
    }
    setBoard(randomBoard);
    setScore(0);
  }, [numCandyTypes, boardSize]);

  useEffect(() => {
    createBoard();
  }, [createBoard]);

  // check match 3, 4, 5
  const checkForMatches = useCallback(() => {
    const newBoard = [...board];
    let foundMatch = false;

    // Check row
    for (let i = 0; i < boardSize * boardSize; i++) {
      const row = Math.floor(i / boardSize);

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
  }, [board, playSound]);

  // 3. handle move into square below
  const moveIntoSquareBelow = useCallback(() => {
    const newBoard = [...board];
    let moved = false;

    for (let i = 0; i <= boardSize * (boardSize - 1) - 1; i++) {
        const isFirstRow = i < boardSize;

        if (isFirstRow && newBoard[i] === "") {
            const availableCandies = CANDY_TYPES.slice(0, numCandyTypes);
            newBoard[i] = availableCandies[Math.floor(Math.random() * numCandyTypes)].id;
            moved = true;
        }

        if (newBoard[i + boardSize] === "") {
            newBoard[i + boardSize] = newBoard[i];
            newBoard[i] = "";
            moved = true;
        }
    }

    if (moved) setBoard(newBoard);
  }, [board, boardSize, numCandyTypes]); 

  useEffect(() => {
    const timer = setInterval(() => {
      const matched = checkForMatches();
      if (!matched) {
        moveIntoSquareBelow();
      }
    }, 150);
    return () => clearInterval(timer);
  }, [checkForMatches, moveIntoSquareBelow]);

  // 4. handle Swap
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
        <div className="flex items-center justify-center gap-4">
          <p className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="text-yellow-500" /> {score}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <RoundButton size="small" variant="primary" onClick={createBoard}>
          <RefreshCcw className="w-4 h-4 mr-2" /> CHƠI MỚI
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

      {/* BOARD GAME */}
      <div className="relative p-4 bg-muted/50 rounded-[2.5rem] shadow-2xl border-4 border-primary/20">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {board.map((typeId, index) => {
            const type = CANDY_TYPES.find(t => t.id === typeId);
            const Icon = type?.icon;
            
            return (
              <motion.button
                key={`${index}-${typeId}`}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSquareClick(index)}
                className={cn(
                  "w-10 h-10 sm:w-15 sm:h-15 rounded-lg flex items-center justify-center transition-all relative bg-transparent",
                  "bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-inner",
                  selectedSquare === index ? "ring-4 ring-primary z-20" : "ring-0"
                )}
              > 
                <AnimatePresence>
                  {Icon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0, rotate: 90 }}
                    >
                      <img src={Icon} alt={type.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-muted-foreground text-sm font-medium animate-pulse">
        Mẹo: Chọn 2 ô cạnh nhau để tráo đổi vị trí!
      </p>
    </div>
  );
}