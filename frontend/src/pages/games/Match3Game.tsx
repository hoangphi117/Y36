import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCcw, 
  Trophy,
  Pause,
  PlayCircle,
  Clock,
  Target,
  Settings,
  Download,
  ChevronLeft,
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
import { GameBoardConfig, GameMode, TimeAndRoundsConfig } from "@/components/games/match3/GameSettings";
import { GameOverOverlay, GamePauseOverlay, GameStartOverlay } from "@/components/games/match3/GameBoardOverlay";
import match3Api from "@/services/match3Api";
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import type { Match3SessionSave } from "@/types/match3Game";
import { convertBoard, createSessionSave } from "@/utils/match3SessionHelper";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";


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
  const [isGameActive, setIsGameActive] = useState(false);
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);
  
  // New states for game modes and features
  const [gameMode, setGameMode] = useState<"time" | "rounds" | "endless">("time");
  const [timeLimit, setTimeLimit] = useState(30); 
  const [targetMatches, setTargetMatches] = useState(10); 
  const [matchesCount, setMatchesCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [targetScore, setTargetScore] = useState(500);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Hàm lấy trạng thái bàn chơi cho hook
  const getBoardState = useCallback((): Match3SessionSave => {
    const matrix = convertBoard(board, boardSize);
    
    const commonData = {
      matrix,
      totalScore: score,
      current_combo: 0, 
    };

    if (gameMode === "rounds") {
      return createSessionSave({
        ...commonData,
        moves_remaining: targetMatches - matchesCount
      });
    } 
    else if(gameMode === "time") {
      return createSessionSave({
        ...commonData,
        time_remaining: timeRemaining
      });
    }
    else {
      return createSessionSave({
        ...commonData,
      });
    }
  }, [board, boardSize, score, gameMode, targetMatches, matchesCount, timeRemaining]);

  // Sử dụng hook useGameSession
  const {
    session,
    currentPlayTime,
    savedSessions,
    isLoading: isSessionLoading,
    isSaving,
    showLoadDialog,
    setShowLoadDialog,
    startGame: startSessionGame,
    loadGame,
    saveGame: saveSessionGame,
    fetchSavedSessions,
    completeGame: completeSessionGame,
    quitGame,
  } = useGameSession({ 
    gameId: 5, // Match3 game ID
    getBoardState 
  });

  const activeCandies = useMemo(() => CANDY_TYPES.slice(0, numCandyTypes), [numCandyTypes]);

  // load default config from API
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const gameDetail = await match3Api.getDetail(5);
        console.log("check default config: ", gameDetail.data.default_config);
        const config = gameDetail.data.default_config;
        setBoardSize(config.cols);
        setNumCandyTypes(config.candy_types);
        setTimeLimit(config.time_limit);
        setTargetScore(config.target_score);

        console.log("check show dialog: ", showLoadDialog);

        if(config.moves_limit > 0) {
          setGameMode("rounds");
          setTargetMatches(config.moves_limit);
        } else {
          setGameMode("time");
        }
        
        setIsConfigLoaded(true);

      } catch (error) {
        console.error("Error fetching game config:", error);
        setIsConfigLoaded(true); // Vẫn cho hiển thị nếu lỗi
      }
    };
    fetchGameConfig();
  }, []);

  // create board
  const initializeBoard = useCallback(() => {
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

    if(gameMode === "time") {
      const target = calcTargetScore(gameMode, boardSize, numCandyTypes, timeLimit);
      setTargetScore(target);
    }
    else if(gameMode === "rounds") {
      const target = calcTargetScore(gameMode, boardSize, numCandyTypes, targetMatches);
      setTargetScore(target);
    }
    else {
      setTargetScore(0);
    }
  }, [boardSize, activeCandies, timeLimit, gameMode, numCandyTypes, targetMatches]);

  // Hàm start game kết hợp với session
  const startGame = useCallback(async () => {
    await startSessionGame(); // Tạo session mới
    initializeBoard(); // Khởi tạo bàn chơi
  }, [startSessionGame, initializeBoard]);

  // Hàm load game từ session đã lưu
  const handleLoadGame = useCallback(async (sessionId: string) => {
    await loadGame(sessionId);
    console.log("check load game: ", session);
    // TODO: Load board state from session.board_state
    // const savedState = session?.board_state as Match3SessionSave;
    // if (savedState) {
    //   // Restore board, score, etc. from savedState
    // }
    initializeBoard(); // Tạm thời init mới, sau này sẽ restore từ savedState
  }, [loadGame, initializeBoard]);

  // open saved games dialog
  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

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
      // setMatchesCount(prev => prev + 1);
      setBoard(newBoard);
      // playSound("pop");
    }
    return foundMatch;
  }, [board, boardSize, isGameActive]);

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
    if (!isGameActive || isPaused || gameMode !== "time" || showGameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setShowGameOver(true);
          setIsGameActive(false);
          // Gọi completeGame từ hook
          setTimeout(() => {
            completeSessionGame(score);
          }, 500);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isPaused, gameMode, showGameOver, completeSessionGame, score]);

  // Check for target matches
  useEffect(() => {
    if (gameMode === "rounds" && matchesCount >= targetMatches && isGameActive) {
      setShowGameOver(true);
      setIsGameActive(false);
      // Gọi completeGame từ hook
      setTimeout(() => {
        completeSessionGame(score);
      }, 500);
    }
  }, [matchesCount, targetMatches, gameMode, isGameActive, completeSessionGame, score]);

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

  // Save game sử dụng hook
  const handleSaveAndExit = async () => {
    try {
      await saveSessionGame(true); // manual = true
      setIsGameActive(false);
      setIsPaused(false);
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  // Handle restart from pause menu
  const handleRestartFromPause = () => {
    setIsPaused(false);
    startGame();
  };

  // Hiển thị loading trong khi chờ config hoặc session
  if (!isConfigLoaded || isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải cài đặt game...</p>
        </div>
      </div>
    );
  }

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
        )}
      </div>

      {/* Controls and Settings Section */}
      <div className="w-full max-w-6xl px-4 mb-8">

        {/* Game Active Controls */}
        {isGameActive && (
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <RoundButton size="small" variant="danger" onClick={resetToSetup}>
              <ChevronLeft />
              <span className="hidden min-[375px]:inline ml-1">Thoát</span>
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
          </div>
        )}

        {/* Settings Section */}
        {!isGameActive && (
          <div className="space-y-4">

            {/* Game Mode Selection */}
            <GameMode
              gameMode={gameMode}
              setGameMode={setGameMode}
            />

            {/* Time and Rounds Settings - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Time Settings */}
              <TimeAndRoundsConfig
                gameMode={gameMode}
                setTimeLimit={setTimeLimit}
                setTargetMatches={setTargetMatches}
                timeLimit={timeLimit}
                targetMatches={targetMatches}
                defaultTimeLimit={30}
                defaultTargetMatches={10}
              />

              {/* Board Settings */}
              <GameBoardConfig
                numCandyTypes={numCandyTypes}
                setNumCandyTypes={setNumCandyTypes}
                boardSize={boardSize}
                setBoardSize={setBoardSize}
              />
            </div>

            <div className="flex justify-center mt-5">
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
            
          </div>
        )}
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

        {/* Game Start Overlay */}
        {!isGameActive && (
          <GameStartOverlay activeCandies={activeCandies} startGame={startGame} />
        )}

        {/* Pause overlay */}
        {isGameActive && isPaused && (
          <GamePauseOverlay resetToSetup={resetToSetup} />
        )}

        {/* Game Over Modal */}
        {showGameOver && (
          <GameOverOverlay 
            score={score} 
            targetScore={targetScore}
            resetToSetup={resetToSetup} 
            startGame={startGame}
          />
        )}
      </div>
        {isPaused && (
          <PauseMenu 
            onContinue={() => setIsPaused(!isPaused)}
            onSaveAndExit={handleSaveAndExit}
            onRestart={handleRestartFromPause}
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