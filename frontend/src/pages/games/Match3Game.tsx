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
  Loader2,
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
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import { convertBoard, restoreBoard } from "@/utils/match3SessionHelper";
import { useNavigate } from "react-router-dom";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { useGameSession } from "@/hooks/useGameSession";
import type { board_state } from "@/types/match3Game";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { GameLayout } from "@/components/layouts/GameLayout";

import { useGameSound } from "@/hooks/useGameSound";


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
  const [gameMode, setGameMode] = useState<"time" | "rounds" | "endless">("rounds");
  const [timeLimit, setTimeLimit] = useState(30); 
  const [targetMatches, setTargetMatches] = useState(10); 
  const [matchesCount, setMatchesCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [targetScore, setTargetScore] = useState(500);
  
  // game sounds
  const { playSound } = useGameSound(true);
  
  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const activeCandies = useMemo(() => CANDY_TYPES.slice(0, numCandyTypes), [numCandyTypes]);

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

  const gameSession = useGameSession({ gameId: 5, getBoardState, autoCreate: false });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Set isInitializing to false after a short delay to show loading
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const createRandomBoard = useCallback((size: number, candyTypes: number): string[] => {
    const randomBoard: string[] = [];
    const activeCandies = CANDY_TYPES.slice(0, candyTypes);
    
    for (let i = 0; i < size * size; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      const validTypes = activeCandies.filter(type => {
        if (col >= 2 && randomBoard[i - 1] === type.id && randomBoard[i - 2] === type.id) {
          return false;
        }
        if (row >= 2 && randomBoard[i - size] === type.id && randomBoard[i - (size * 2)] === type.id) {
          return false;
        }
        return true;
      });

      const randomType = validTypes.length > 0 
        ? validTypes[Math.floor(Math.random() * validTypes.length)]
        : activeCandies[Math.floor(Math.random() * activeCandies.length)];
      randomBoard.push(randomType.id);
    }
    
    return randomBoard;
  }, []);
  useEffect(() => {
    const getDefaultConfig = async () => {
      try {
        const response = await axiosClient.get(`/games/5`);
        const defaultConfig = response.data.data.default_config;
        setBoardSize(defaultConfig.cols);
        setNumCandyTypes(defaultConfig.candy_types);
        setTimeLimit(defaultConfig.time_limit);
        setTargetScore(defaultConfig.target_score);
        if(defaultConfig.time_limit && defaultConfig.time_limit > 0) {
          setGameMode("time");
          setTimeRemaining(defaultConfig.time_limit);
        } else if(defaultConfig.moves_limit && defaultConfig.moves_limit > 0) {
          setGameMode("rounds");
          setTargetMatches(defaultConfig.moves_limit);
          setTimeRemaining(0);
        }

      } catch (error) {
        console.error("Error fetching default config:", error);
      }
    };
    getDefaultConfig();
  }, []);


  // Handle when session is created/loaded from useGameSession
  useEffect(() => {
    try {
      if (!gameSession.session) return;
      
      const newSession = gameSession.session;
      setCurrentSessionId(newSession.id);
      
      // Get config from session - may be in default_config or directly
      const rawConfig = newSession.session_config;
      const config = rawConfig.default_config || rawConfig;
      
      if (!config || !config.cols || !config.candy_types) {
        console.error("Invalid config:", rawConfig);
        return;
      }
      setBoardSize(config.cols);
      setNumCandyTypes(config.candy_types);
      setTimeLimit(config.time_limit);
      setTargetScore(config.target_score);

      // Check if board_state has data
      const sessionData = newSession.board_state as { score?: number; board_state?: board_state } | null;
      const hasBoardState = sessionData && sessionData.board_state && sessionData.board_state.matrix;

      if (hasBoardState) {
        // Restore board from saved board_state
        const boardState = sessionData.board_state!;
        const restoredBoard = restoreBoard(boardState.matrix);
        setBoard(restoredBoard);
        
        // Restore score
        if (sessionData.score !== undefined) {
          setScore(sessionData.score);
        }
        
        // Restore game mode and progress based on what's in board_state
        if (boardState.time_remaining !== undefined) {
          setGameMode("time");
          setTimeRemaining(boardState.time_remaining);
          setTimeLimit(config.time_limit || 30);
        } else if (boardState.moves_remaining !== undefined) {
          setGameMode("rounds");
          setTargetMatches(config.moves_limit);
          setMatchesCount(config.moves_limit - boardState.moves_remaining);
          setTimeRemaining(0);
        } else {
          // Fallback to config
          if (config.moves_limit && config.moves_limit > 0) {
            setGameMode("rounds");
            setTargetMatches(config.moves_limit);
            setMatchesCount(0);
            setTimeRemaining(0);
          } else if (config.time_limit && config.time_limit > 0) {
            setGameMode("time");
            setTimeRemaining(config.time_limit);
          }
        }
      } else {
        // Create new board by randomization
        const randomBoard = createRandomBoard(config.cols, config.candy_types);
        setBoard(randomBoard);
        setScore(0);
        setMatchesCount(0);
        
        if(config.moves_limit && config.moves_limit > 0) {
          setGameMode("rounds");
          setTargetMatches(config.moves_limit);
          setTimeRemaining(0);
        } else if(config.time_limit && config.time_limit > 0) {
          setGameMode("time");
          setTimeRemaining(config.time_limit);
        } else {
          setGameMode("time");
          setTimeRemaining(30);
        }
      }
      
      setIsPaused(false);
      setShowGameOver(false);
      setIsInitializing(false);
      setHasStarted(true);
    } catch (error) {
      console.error("Error loading session:", error);
      setIsInitializing(false);
    }
  }, [gameSession.session, createRandomBoard]);

  // Restart game with new settings
  const restartGameWithSettings = useCallback(async (newSettings?: {
    gameMode: "time" | "rounds" | "endless";
    timeLimit: number;
    targetMatches: number;
    numCandyTypes: number;
    boardSize: number;
  }) => {
    try {
      // Reset game over state immediately
      setShowGameOver(false);
      setIsPaused(false);
      
      // Use new settings if available, otherwise use current values
      const settings = newSettings || { gameMode, timeLimit, targetMatches, numCandyTypes, boardSize };
      
      let target = 500;
      if(settings.gameMode === "time") {
        target = calcTargetScore(settings.gameMode, settings.boardSize, settings.numCandyTypes, settings.timeLimit);
      }
      else if(settings.gameMode === "rounds") {
        target = calcTargetScore(settings.gameMode, settings.boardSize, settings.numCandyTypes, settings.targetMatches);
      }
      
      // Create sessionConfig from settings
      const sessionConfig = {
        mode: "vs_ai",
        ai_level: "easy",
        seed_version: "v3_heavy",
        default_config: {
          cols: settings.boardSize,
          rows: settings.boardSize,
          time_limit: settings.gameMode === "time" ? settings.timeLimit : 0,
          candy_types: settings.numCandyTypes,
          moves_limit: settings.gameMode === "rounds" ? settings.targetMatches : 0,
          target_score: target,
        }
      };

      // Create new session with custom config
      await gameSession.startGame(sessionConfig);
    } catch (error) {
      console.error("Error restarting game:", error);
    }
  }, [currentSessionId, gameMode, timeLimit, boardSize, numCandyTypes, targetMatches, gameSession]);

  // Start game for the first time
  const handleStartGame = async () => {
    setIsInitializing(true);
    await gameSession.startGame();
  };

  // Quick restart game (without changing settings or creating new session)
  const quickRestart = useCallback(() => {
    // Reset board with current config
    const randomBoard = createRandomBoard(boardSize, numCandyTypes);
    setBoard(randomBoard);
    setScore(0);
    setMatchesCount(0);
    setTimeRemaining(gameMode === "time" ? timeLimit : 0);
    setIsPaused(false);
    setShowGameOver(false);
  }, [boardSize, numCandyTypes, createRandomBoard, gameMode, timeLimit]);

  // Check for matches (3, 4, 5)
  const checkForMatches = useCallback(() => {
    const newBoard = [...board];
    let foundMatch = false;

    // Check rows
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

    // Check columns
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
      playSound("pop");
      setBoard(newBoard);
    }
    return foundMatch;
  }, [board, boardSize, playSound]);
  // Handle moving candies into empty squares below
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
    if (!hasStarted || isInitializing || showGameOver) return;
    
    const timer = setInterval(() => {
      const matched = checkForMatches();
      if (!matched) {
        moveIntoSquareBelow();
      }
    }, 150);
    return () => clearInterval(timer);
  }, [hasStarted, checkForMatches, moveIntoSquareBelow, isInitializing, showGameOver]);

  // Timer countdown effect
  useEffect(() => {
    if (!hasStarted || isInitializing || isPaused || gameMode !== "time" || showGameOver || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setShowGameOver(true);

          if(score >= targetScore) {
            // triggerWinEffects moved to overlay
          }
          else {
            playSound("lose");
          }
          
          setTimeout(async () => {
            if (currentSessionId) {
              gameSession.completeGame(score);
            }
          }, 500);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isInitializing, isPaused, gameMode, showGameOver, timeRemaining, currentSessionId, score, timeLimit]);

  // Check if target matches reached
  useEffect(() => {
    if (!hasStarted) return;
    if (gameMode === "rounds" && matchesCount >= targetMatches && !showGameOver) {
      // Complete session
      const completeGame = async () => {
        setShowGameOver(true);

        if(score >= targetScore) {
          // triggerWinEffects moved to overlay
        }
        else {
          playSound("lose");
        }

        if (currentSessionId) {
          gameSession.completeGame(score);
        }
      };
      
      const timer = setTimeout(completeGame, 500);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, matchesCount, targetMatches, gameMode, showGameOver, currentSessionId, score]);

  // Handle candy swap
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

  // Save game session
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

  // Load saved game session
  const handleLoadGame = async (sessionId: string) => {
    setIsInitializing(true);
    await gameSession.loadGame(sessionId);
  }

  // Delete saved game session
  const handleDeleteGame = async (sessionId: string) => {
    await axiosClient.delete(`/sessions/${sessionId}`);
    await gameSession.fetchSavedSessions();
    toast.success("Đã xóa ván chơi!");
  }

  // Play again (restart with same settings)
  const handlePlayAgain = async () => {
    await restartGameWithSettings();
  }

  // Save current session before loading another session
  const handleSaveCurrentSession = async () => {
    if (currentSessionId) {
      await gameSession.saveGame(true);
    }
  }

  // Show loading screen
  if (isInitializing) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse font-medium text-muted-foreground">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <GameLayout gameId={5}>
      <div className="flex flex-col items-center min-h-screen bg-background text-foreground pb-10">

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
          {hasStarted && (
            <RoundButton size="small" variant="primary" onClick={quickRestart} className="text-xs py-1.5 px-3">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Chơi lại
            </RoundButton>
          )}
          
          <LoadGameDialog
            open={gameSession.showLoadDialog}
            onOpenChange={gameSession.setShowLoadDialog}
            sessions={gameSession.savedSessions}
            currentSessionId={currentSessionId ?? undefined}
            onSaveSession={handleSaveCurrentSession}
            onLoadSession={handleLoadGame}
            onDeleteSession={handleDeleteGame}
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
          
          {hasStarted && (
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
          )}
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
            {(board.length > 0 ? board : Array(boardSize * boardSize).fill("")).map((typeId, index) => {
              const type = CANDY_TYPES.find(t => t.id === typeId);
              return (
                <motion.button
                  key={`${index}-${typeId || 'empty'}`}
                  layout
                  whileHover={!isPaused && hasStarted ? { scale: 1.05 } : undefined}
                  onClick={() => !isPaused && hasStarted && handleSquareClick(index)}
                  disabled={isPaused || !hasStarted}
                  className={cn(
                    "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative bg-linear-to-br from-white/10 to-transparent border border-white/10",
                    selectedSquare === index && hasStarted ? "ring-4 ring-primary z-20" : "",
                    isPaused ? "opacity-50 cursor-not-allowed" : "",
                    !hasStarted ? "invisible" : ""
                  )}
                  style={{
                    backgroundImage: `url(${iceBorder})`,
                  }}
                >
                  <AnimatePresence>
                    {type && hasStarted && (
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

        {/* Start Game Overlay */}
        {!hasStarted && !isInitializing && (
          <motion.div
            className="absolute inset-0 bg-muted/95 rounded-[2.5rem] flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {/* Game Logo/Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-3xl mb-2 sm:mb-4">
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Ghép 3 kẹo cùng màu để ghi điểm!
                </p>
              </motion.div>

              {/* Game Info Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-2 sm:gap-3"
              >
                <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-border">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    {gameMode === "time" ? (
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    ) : gameMode === "rounds" ? (
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    ) : (
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Chế độ</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">
                      {gameMode === "time" ? "Thời gian" : gameMode === "rounds" ? "Lượt chơi" : "Vô tận"}
                    </p>
                  </div>
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-border">
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Mục tiêu</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">
                      {gameMode === "time" ? `${timeLimit}s` : gameMode === "rounds" ? `${targetMatches} lượt` : "Không giới hạn"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Start Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <RoundButton
                  size="large"
                  variant="primary"
                  onClick={handleStartGame}
                  className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-2xl hover:scale-105 transition-transform font-bold"
                >
                  <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  BẮT ĐẦU CHƠI
                </RoundButton>
              </motion.div>

            </motion.div>
          </motion.div>
        )}

        {/* Game Over Modal */}
        {showGameOver && (
          <GameOverOverlay 
            score={score} 
            targetScore={targetScore}
            onRestart={handlePlayAgain}
            onExit={() => navigate("/")}
            playTime={gameSession.currentPlayTime}
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

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        gameMode={gameMode}
        timeLimit={timeLimit}
        targetMatches={targetMatches}
        numCandyTypes={numCandyTypes}
        boardSize={boardSize}
        onApply={async (settings) => {
          await restartGameWithSettings(settings);
          setGameMode(settings.gameMode);
          setTimeLimit(settings.timeLimit);
          setTargetMatches(settings.targetMatches);
          setNumCandyTypes(settings.numCandyTypes);
          setBoardSize(settings.boardSize);
        }}
      />
    </GameLayout>
  );
}