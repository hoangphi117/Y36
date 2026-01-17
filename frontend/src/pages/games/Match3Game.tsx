import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy,
  Pause,
  PlayCircle,
  Clock,
  Target,
  Settings,
  RotateCcw,
  Download,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";
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

import calcTargetScore from "@/utils/calcScoreMatch3Game";
import { GameOverOverlay } from "@/components/games/match3/GameBoardOverlay";
import { SettingsDialog } from "@/components/games/match3/SettingsDialog";
import match3Api from "@/services/match3Api";
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import { convertBoard } from "@/utils/match3SessionHelper";
import { useNavigate } from "react-router-dom";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { useGameSession } from "@/hooks/useGameSession";
import type { board_state } from "@/types/match3Game";


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
  const [numCandyTypes, setNumCandyTypes] = useState(NUM_TYPES);
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);
  const navigate = useNavigate();
  
  // Game states
  const [gameMode, setGameMode] = useState<"time" | "rounds" | "endless">("time");
  const [timeLimit, setTimeLimit] = useState(30); 
  const [targetMatches, setTargetMatches] = useState(10); 
  const [matchesCount, setMatchesCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [targetScore, setTargetScore] = useState(500);
  
  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const activeCandies = useMemo(() => CANDY_TYPES.slice(0, numCandyTypes), [numCandyTypes]);

  // getBoardState để truyền cho useGameSession
  const getBoardState = useCallback(() => {
    const matrix = convertBoard(board, boardSize);
    const boardState: board_state = {
      matrix,
      current_combo: 0,
      ...(gameMode === "rounds" ? { moves_remaining: targetMatches - matchesCount } : {}),
      ...(gameMode === "time" ? { time_remaining: timeRemaining } : {}),
    };
    return {
      score,
      board_state: boardState,
    };
  }, [board, boardSize, score, gameMode, targetMatches, matchesCount, timeRemaining]);

  // Tích hợp useGameSession (chỉ dùng để load saved sessions, không auto-start)
  const gameSession = useGameSession({ gameId: 5, getBoardState });

  // Hàm tạo random board (đảm bảo không có matches ban đầu)
  const createRandomBoard = useCallback((size: number, candyTypes: number): string[] => {
    const randomBoard: string[] = [];
    const activeCandies = CANDY_TYPES.slice(0, candyTypes);
    
    for (let i = 0; i < size * size; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      // Lọc ra các loại candy hợp lệ (không tạo thành hàng 3 hoặc dòng 3)
      const validTypes = activeCandies.filter(type => {
        // Kiểm tra hàng ngang: nếu có 2 ô liền kề trước đó cùng loại thì loại bỏ
        if (col >= 2 && randomBoard[i - 1] === type.id && randomBoard[i - 2] === type.id) {
          return false;
        }
        // Kiểm tra cột dọc: nếu có 2 ô phía trên cùng loại thì loại bỏ
        if (row >= 2 && randomBoard[i - size] === type.id && randomBoard[i - (size * 2)] === type.id) {
          return false;
        }
        return true;
      });

      // Chọn random từ danh sách hợp lệ
      const randomType = validTypes.length > 0 
        ? validTypes[Math.floor(Math.random() * validTypes.length)]
        : activeCandies[Math.floor(Math.random() * activeCandies.length)];
      randomBoard.push(randomType.id);
    }
    
    return randomBoard;
  }, []);

  // Auto-start game khi vào trang bằng useGameSession
  useEffect(() => {
    gameSession.startGame();
  }, []);

  // Xử lý khi session được tạo/load từ useGameSession
  useEffect(() => {
    if (!gameSession.session) return;
    
    const newSession = gameSession.session;
    
    // Chỉ khởi tạo nếu chưa có currentSessionId hoặc session ID khác
    if (currentSessionId === newSession.id) return;
    
    setCurrentSessionId(newSession.id);
    
    // Lấy config từ session
    const config = newSession.session_config;
    setBoardSize(config.cols);
    setNumCandyTypes(config.candy_types);
    setTimeLimit(config.time_limit);
    setTargetScore(config.target_score);

    // Xác định game mode dựa trên moves_limit
    if(config.moves_limit && config.moves_limit > 0) {
      setGameMode("rounds");
      setTargetMatches(config.moves_limit);
      setTimeRemaining(0);
    } else if(config.time_limit && config.time_limit > 0) {
      setGameMode("time");
      setTimeRemaining(config.time_limit);
    } else {
      // Default to time mode nếu cả 2 đều là 0
      setGameMode("time");
      setTimeRemaining(30);
    }
    
    // Khởi tạo board
    const randomBoard = createRandomBoard(config.cols, config.candy_types);
    setBoard(randomBoard);
    setScore(0);
    setMatchesCount(0);
    setIsPaused(false);
    setShowGameOver(false);
    
    setIsInitializing(false);
  }, [gameSession.session, currentSessionId, createRandomBoard]);

  // Hàm restart game với settings mới
  const restartGameWithSettings = useCallback(async () => {
    try {
      // Reset game over state ngay lập tức
      setShowGameOver(false);
      setIsPaused(false);
      
      // Complete session cũ nếu có
      if (currentSessionId) {
        await match3Api.completeSession(currentSessionId, score, 
          gameMode === "time" ? timeLimit - timeRemaining : 0);
      }
      
      // Tạo session mới
      const res = await match3Api.startSession(5);
      const newSession = res.session;
      setCurrentSessionId(newSession.id);
      
      // Tính target score dựa trên settings hiện tại (đã được update từ dialog)
      if(gameMode === "time") {
        const target = calcTargetScore(gameMode, boardSize, numCandyTypes, timeLimit);
        setTargetScore(target);
        setTimeRemaining(timeLimit);
      }
      else if(gameMode === "rounds") {
        const target = calcTargetScore(gameMode, boardSize, numCandyTypes, targetMatches);
        setTargetScore(target);
        setTimeRemaining(0);
      }
      
      // Tạo board mới với settings hiện tại
      const randomBoard = createRandomBoard(boardSize, numCandyTypes);
      setBoard(randomBoard);
      setScore(0);
      setMatchesCount(0);
    } catch (error) {
      console.error("Error restarting game:", error);
    }
  }, [currentSessionId, score, gameMode, timeLimit, timeRemaining, boardSize, numCandyTypes, targetMatches, createRandomBoard]);

  // Hàm restart game nhanh (không thay đổi settings)
  const quickRestart = useCallback(async () => {
    try {
      // Complete session cũ
      // if (currentSessionId) {
      //   await match3Api.completeSession(currentSessionId, score,
      //     gameMode === "time" ? timeLimit - timeRemaining : 0);
      // }
      
      // Tạo session mới
      const res = await match3Api.startSession(5);
      setCurrentSessionId(res.session.id);
      
      // Reset board với config hiện tại
      const randomBoard = createRandomBoard(boardSize, numCandyTypes);
      setBoard(randomBoard);
      setScore(0);
      setMatchesCount(0);
      setTimeRemaining(gameMode === "time" ? timeLimit : 0);
      setIsPaused(false);
      setShowGameOver(false);
    } catch (error) {
      console.error("Error restarting game:", error);
    }
  }, [currentSessionId, score, gameMode, timeLimit, timeRemaining, boardSize, numCandyTypes, createRandomBoard]);

  // check match 3, 4, 5
  const checkForMatches = useCallback(() => {
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
    }
    return foundMatch;
  }, [board, boardSize]);

  // handle move into square below
  const moveIntoSquareBelow = useCallback(() => {
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
  }, [board, boardSize, activeCandies]); 

  useEffect(() => {
    if (isInitializing || showGameOver) return;
    
    const timer = setInterval(() => {
      const matched = checkForMatches();
      if (!matched) {
        moveIntoSquareBelow();
      }
    }, 150);
    return () => clearInterval(timer);
  }, [checkForMatches, moveIntoSquareBelow, isInitializing, showGameOver]);

  // Timer effect
  useEffect(() => {
    // Chỉ chạy timer khi đang ở mode time, có thời gian còn lại, và game đang active
    if (isInitializing || isPaused || gameMode !== "time" || showGameOver || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setShowGameOver(true);
          // Complete session
          setTimeout(async () => {
            if (currentSessionId) {
              await match3Api.completeSession(currentSessionId, score, timeLimit);
            }
          }, 500);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInitializing, isPaused, gameMode, showGameOver, timeRemaining, currentSessionId, score, timeLimit]);

  // Check for target matches
  useEffect(() => {
    if (gameMode === "rounds" && matchesCount >= targetMatches && !showGameOver) {
      // Complete session
      const completeGame = async () => {
        setShowGameOver(true);
        if (currentSessionId) {
          await match3Api.completeSession(currentSessionId, score, 0);
        }
      };
      
      const timer = setTimeout(completeGame, 500);
      return () => clearTimeout(timer);
    }
  }, [matchesCount, targetMatches, gameMode, showGameOver, currentSessionId, score]);

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
        setMatchesCount(prev => prev + 1);
      }
      setSelectedSquare(null);
    }
  };

  // load saved session vào game
  const handleLoadSession = async (sessionId: string) => {  
    await gameSession.loadGame(sessionId);
  }

  const handleOpenSavedSessions = async () => {
    await gameSession.fetchSavedSessions();
    gameSession.setShowLoadDialog(true);
  }

  // Save game
  const handleSaveGame = async () => {
    if (!gameSession.session) {
      console.error("No active session to save.");
      return;
    }
    
    try {
      await gameSession.saveGame(true);
      navigate('/');
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  // Hiển thị loading
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang khởi tạo game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground pb-10">

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        gameMode={gameMode}
        setGameMode={setGameMode}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        targetMatches={targetMatches}
        setTargetMatches={setTargetMatches}
        numCandyTypes={numCandyTypes}
        setNumCandyTypes={setNumCandyTypes}
        boardSize={boardSize}
        setBoardSize={setBoardSize}
        onApply={restartGameWithSettings}
      />

      <div className="z-20">
        <GameHeader />
      </div>

      <div className="text-center my-8 space-y-2">
        <h1 className="text-4xl font-black text-primary uppercase italic drop-shadow-md">
          MATCH 3 COMBO
        </h1>
        <motion.div className="flex items-center gap-4 justify-center text-2xl font-bold">
          <motion.p key="stat-score" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Trophy className="text-yellow-500" /> 
            {score}/{targetScore}
          </motion.p>
          
          {gameMode === "time" && (
            <motion.p 
              key={`timer-${timeRemaining}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl",
                timeRemaining < 30 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
              )}
            >
              <Clock className="w-5 h-5" /> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </motion.p>
          )}
          
          {gameMode === "rounds" && (
            <motion.p key={`rounds-stat-${matchesCount}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent">
              <Target className="w-5 h-5" /> {matchesCount}/{targetMatches}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-6xl px-4 mb-8">
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          <RoundButton size="small" variant="primary" onClick={quickRestart} className="text-xs py-1.5 px-3">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Chơi lại
          </RoundButton>
          
          <LoadGameDialog
            open={gameSession.showLoadDialog}
            onOpenChange={gameSession.setShowLoadDialog}
            sessions={gameSession.savedSessions}
            onLoadSession={(sessionId) => {
              // Navigate sang route với sessionId để load
              navigate(`/games/match3/${sessionId}`);
            }}
            onNewGame={async () => {
              // Restart game hiện tại
              gameSession.setShowLoadDialog(false);
              await quickRestart();
            }}
          >
            <RoundButton 
              size="small" 
              variant="neutral" 
              onClick={() => {
                gameSession.fetchSavedSessions();
                gameSession.setShowLoadDialog(true);
              }} 
              className="text-xs py-1.5 px-3 rounded-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> 
            </RoundButton>
            
          </LoadGameDialog>
          
          <RoundButton 
            size="small" 
            variant="accent" 
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs py-1.5 px-3"
          >
            {isPaused ? (
              <>
                <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> TIẾP TỤC
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" /> TẠM DỪNG
              </>
            )}
          </RoundButton>
          <RoundButton size="small" variant="neutral" onClick={() => setShowSettingsDialog(true)} className="text-xs py-1.5 px-3">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> CÀI ĐẶT
          </RoundButton>
        </div>
      </div>

      {/* BOARD GAME */}
      <div className="relative flex justify-center mb-8">
        <div className="relative bg-muted/50 rounded-[2.5rem] shadow-2xl border-4 border-primary/20 flex justify-center items-center" style={{ 
          aspectRatio: '1',
          padding: `${boardSize <= 6 ? '1rem' : '0.75rem'}`,
          width: 'fit-content'
        }}>
          <div
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
              gap: `${boardSize <= 6 ? '0.5rem' : '0.375rem'}`
            }}
          >
            {board.map((typeId, index) => {
              const type = CANDY_TYPES.find(t => t.id === typeId);
              return (
                <motion.button
                  key={`${index}-${typeId}`}
                  layout
                  whileHover={!isPaused ? { scale: 1.05 } : undefined}
                  onClick={() => !isPaused && handleSquareClick(index)}
                  disabled={isPaused}
                  className={cn(
                    "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative bg-linear-to-br from-white/10 to-transparent border border-white/10",
                    selectedSquare === index ? "ring-4 ring-primary z-20" : "",
                    isPaused ? "opacity-50 cursor-not-allowed" : ""
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
            })}
          </div>

        {/* Game Over Modal */}
        {showGameOver && (
          <GameOverOverlay 
            score={score} 
            targetScore={targetScore}
            onRestart={quickRestart}
            onExit={() => navigate("/")}
          />
        )}
      </div>
        {isPaused && (
          <PauseMenu 
            onContinue={() => setIsPaused(false)}
            onSaveAndExit={handleSaveGame}
            onRestart={quickRestart}
          />
        )}
        
      </div>

        <div className="mt-8 px-4 max-w-2xl">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              💡 Mẹo: Chọn 2 ô cạnh nhau để tráo đổi vị trí!
            </p>
          </div>
        </div>
    </div>
  );
}