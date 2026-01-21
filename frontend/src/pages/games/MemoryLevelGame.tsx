import icon1 from "@/assets/memoryIcons/icon1.png";
import icon2 from "@/assets/memoryIcons/icon2.png";
import icon3 from "@/assets/memoryIcons/icon3.png";
import icon4 from "@/assets/memoryIcons/icon4.png";
import icon5 from "@/assets/memoryIcons/icon5.png";
import icon6 from "@/assets/memoryIcons/icon6.png";
import icon7 from "@/assets/memoryIcons/icon7.png";
import icon8 from "@/assets/memoryIcons/icon8.png";
import icon9 from "@/assets/memoryIcons/icon9.png";
import icon10 from "@/assets/memoryIcons/icon10.png";
import icon11 from "@/assets/memoryIcons/icon11.png";
import icon12 from "@/assets/memoryIcons/icon12.png";
import icon13 from "@/assets/memoryIcons/icon13.png";
import icon14 from "@/assets/memoryIcons/icon14.png";
import icon15 from "@/assets/memoryIcons/icon15.png";
import icon16 from "@/assets/memoryIcons/icon16.png";
import { useEffect, useState, memo, useRef } from "react";
import { motion } from "framer-motion";
import { AlarmClock, Pause, Download, RotateCcw, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToSelectionButton } from "@/components/games/memory/SettingButtons";
import StatCard from "@/components/games/memory/StatCard";
import { GameStatusOverlay } from "@/components/games/memory/GameBoardOverlay";
import { useNavigate } from "react-router-dom";
import calcLevelScore from "@/utils/clacScoreMemoryGame";
import { RoundButton } from "@/components/ui/round-button";
import { convertCardsToBoardState, createSessionSave, restoreBoardState } from "@/utils/memorySessionHelper";
import type { MemorySessionSave } from "@/types/memoryGame";
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { toast } from "react-hot-toast";
import axiosClient from "@/lib/axios";
import { GameLayout } from "@/components/layouts/GameLayout";
import { GameInstructions } from "@/components/games/GameInstructions";

const ICONS = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, icon11, icon12, icon13, icon14, icon15, icon16];

interface MemoryLevelConfig {
  pairs: number;
  timeLimit: number;
}

const MAX_PAIRS = 15;
const MAX_LEVELS = 5;

function generateMemoryLevels(basePairs: number, baseTimeLimit: number): MemoryLevelConfig[] {
  const levels: MemoryLevelConfig[] = [];

  for (let i = 0; i < MAX_LEVELS; i++) {
    const pairs = Math.min(basePairs + i * 2, MAX_PAIRS);
    const timeLimit = baseTimeLimit + i * 15;

    levels.push({ pairs, timeLimit });

    // Stop if reached max pairs
    if (pairs >= MAX_PAIRS) break;
  }

  return levels;
}


interface Card {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type GameStatus = "playing" | "completed" | "lost";

export default function MemoryLevelGame({ onBack, onGoHome }: { onBack?: () => void, onGoHome?: () => void }) {
  const navigate = useNavigate(); 

  const [currentLevel, setCurrentLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [levelConfigs, setLevelConfigs] = useState<MemoryLevelConfig[]>([]);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  //session id for saving
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Ref to store timeout ID for clearing
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate shuffled cards
  const generateCards = (pairs: number): Card[] => {
    const icons = ICONS.slice(0, pairs);
    const cardArray: Card[] = [];
    
    icons.forEach((_, index) => {
      cardArray.push(
        { id: index * 2, iconIndex: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, iconIndex: index, isFlipped: false, isMatched: false }
      );
    });

    return cardArray.sort(() => Math.random() - 0.5);
  };

  // Get current game session state
  const getCurrentSessionState = (): MemorySessionSave => {
    const board = convertCardsToBoardState(cards, flipped, matched);
    return createSessionSave(
      board,
      timeLeft,
      currentLevel,
      moves,
      totalScore,
    );
  };

  // useGameSession hook to manage game session
  const {
    session, savedSessions,
    currentPlayTime,
    fetchSavedSessions,
    isLoading: isSessionLoading,
    isSaving: isSessionSaving,
    showLoadDialog, setShowLoadDialog,
    startGame: startGameSession,
    saveGame: saveGameSession,
    loadGame: loadGameSession,
    completeGame: completeGameSession,
  } = useGameSession({
    gameId: 6, // memory game id
    getBoardState: () => getCurrentSessionState(),
    autoCreate: false,
    onQuit: onBack,
  });

  // start new game session
  useEffect(() => {
    startGameSession();
  }, []);

  // Xử lý khi session được tạo/load từ useGameSession
  useEffect(() => {
    try {
      if(!session) return;

      setCurrentSessionId(session.id);

      // Lấy config từ session - có thể ở default_config hoặc trực tiếp
      const rawConfig = session.session_config;
      const config = rawConfig.default_config || rawConfig;
      
      if(!config || !config.cols || !config.rows) {
        console.error("Invalid session config:", config);
        return;
      }

      // Tính số cặp từ cols * rows / 2
      const basePairs = (config.cols * config.rows) / 2;
      const baseTimeLimit = config.time_limit || 45;

      // Sinh các level từ config
      const generatedLevels = generateMemoryLevels(basePairs, baseTimeLimit);
      setLevelConfigs(generatedLevels);

      // Kiểm tra board_state có dữ liệu không
      const sessionData = session.board_state as MemorySessionSave | null;
      const hasBoardState = sessionData && sessionData.cards && sessionData.cards.length > 0;

      if (hasBoardState) {
        // Restore board từ saved session
        setIsRestoringSession(true);
        const { cards: restoredCards, flipped: restoredFlipped, matched: restoredMatched } = restoreBoardState(sessionData!.cards);
        
        setCards(restoredCards);
        setFlipped(restoredFlipped);
        setMatched(restoredMatched);
        setMoves(sessionData!.moves || 0);
        setTotalScore(sessionData!.score || 0);
        setCurrentLevel(sessionData!.level || 0);
        setTimeLeft(sessionData!.time_left || generatedLevels[sessionData!.level || 0].timeLimit);
        setGameStatus("playing");
        setIsStarted(true);
        
        // Reset flag sau khi restore xong
        setTimeout(() => setIsRestoringSession(false), 0);
      } else {
        // Khởi tạo game mới với level 1
        const level1Config = generatedLevels[0];
        const newCards = generateCards(level1Config.pairs);
        setCards(newCards);
        setTimeLeft(level1Config.timeLimit);
        setFlipped([]);
        setMatched([]);
        setGameStatus("playing");
        setMoves(0);
        setTotalScore(0);
        setCurrentLevel(0);
        setIsStarted(true); 
      }

    }catch (error) {
      console.error("Error loading session:", error);
    }
  }, [session]);

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (!isStarted || gameStatus !== "playing" || flipped.includes(cardId) || matched.includes(cardId) || isPaused) {
      return;
    }

    // Clear any pending timeout to prevent unwanted state changes
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // if have 2 cards flipped, close them and open new card
    if (flipped.length === 2) {
      // Always open the new card when 2 cards are already flipped
      setFlipped([cardId]);
      return;
    }

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      if (cards[first].iconIndex === cards[second].iconIndex) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          setFlipped([]);
          closeTimeoutRef.current = null;
        }, 400);
      }
    }
  };

  // Timer for level mode
  useEffect(() => {
    if (gameStatus !== "playing" || !isStarted || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameStatus("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, isStarted, isPaused]);

  // Check level completion
  useEffect(() => {
    if (gameStatus !== "playing" || matched.length === 0 || levelConfigs.length === 0) return;

    const levelConfig = levelConfigs[currentLevel];
    if (matched.length === levelConfig.pairs * 2) {

      // Calculate score
      const levelScore = calcLevelScore({
        pairs: levelConfig.pairs,
        timeLeft,
        timeLimit: levelConfig.timeLimit,
        moves
      });

      setTotalScore(prev => prev + levelScore);
      setGameStatus("completed");
      
      // triggerWinEffects moved to overlay
    }
  }, [matched, currentLevel, gameStatus, timeLeft, levelConfigs]);

  // Auto complete game when lost or completed
  useEffect(() => {
    if (gameStatus === "lost" || (gameStatus === "completed" && currentLevel === levelConfigs.length - 1)) {
      completeGameSession(totalScore);
    }
  }, [gameStatus, currentLevel, totalScore, levelConfigs.length]);

  // Initialize game when level changes 
  useEffect(() => {
    if (levelConfigs.length === 0 || !isStarted || isRestoringSession) return;
    const levelConfig = levelConfigs[currentLevel];
    const newCards = generateCards(levelConfig.pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setGameStatus("playing");
    setTimeLeft(levelConfig.timeLimit);
    setMoves(0);
  }, [currentLevel]);

  // Next level
  const nextLevel = () => {
    if (levelConfigs.length > 0 && currentLevel < levelConfigs.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Reset to mode selection
  const backToSelection = () => {
    if (onBack) onBack();
    else navigate("/memory");
  };

  // Restart current level
  const restartCurrentLevel = () => {
    if (levelConfigs.length === 0) return;
    const levelConfig = levelConfigs[currentLevel];
    const newCards = generateCards(levelConfig.pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setGameStatus("playing");
    setTimeLeft(levelConfig.timeLimit);
    setMoves(0);
  };

  // Handle pause menu - save game session
  const handleSaveAndExit = async () => {
    try {
      // Close pause menu first
      setIsPaused(false);
      
      // Save game session
      await saveGameSession(true);
      if(onBack) onBack();
    } catch (error) {
      console.error("Error saving game:", error);
      // Still navigate back even if save fails
      if(onBack) onBack();
    }
  };

  // load saved game
  const handleLoadGame = async (sessionId: string) => {
    await loadGameSession(sessionId);
  }

  // delete saved game
  const handleDeleteGame = async (sessionId: string) => {
    await axiosClient.delete(`/sessions/${sessionId}`);
    await fetchSavedSessions();
    toast.success("Đã xóa ván chơi!");
  }

  // play again
  const handlePlayAgain = async () => {
    startGameSession();
    setIsPaused(false);
  }

  // handle save currrent session before loading another session
  const handleSaveCurrentSession = async () => {
    if (currentSessionId) {
      await saveGameSession(true);
    }
  }

  // Calculate responsive columns based on screen width and card count
  const getResponsiveColumns = (totalCards: number): number => {
    if (typeof window === "undefined") return 4;
    
    const screenWidth = window.innerWidth;
    const cardSizeWithGap = screenWidth < 768 ? 56 + 6 : 80 + 10; // card size + gap
    const availableWidth = screenWidth - 40; // account for padding
    const maxColumns = Math.floor(availableWidth / cardSizeWithGap);
    
    // Calculate ideal columns that fit the total cards best
    const idealColumns = Math.ceil(Math.sqrt(totalCards));
    
    // Return the smaller of ideal or max possible
    return Math.min(Math.max(2, maxColumns), idealColumns);
  };

  // Render card component with memo to prevent unnecessary re-renders
  const CardComponent = memo(({ card, isFlipped, isMatched, onClick }: any) => {
    const isDisabled = isMatched || isFlipped;
    
    return (
      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05 } : undefined}
        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
        className={cn(
          "relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg",
          "flex items-center justify-center font-bold text-sm sm:text-xl md:text-2xl",
          "border-2 border-primary/30",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          isMatched 
            ? "bg-muted" 
            : isFlipped
            ? "bg-primary text-white shadow-lg"
            : "bg-gradient-to-br from-accent via-accent/80 to-accent/60 text-primary hover:shadow-xl"
        )}
      >
        {isFlipped && (
          <img 
            src={ICONS[card.iconIndex]} 
            alt="icon" 
            className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
          />
        )}
      </motion.button>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison to prevent re-render if props haven't changed
    return (
      prevProps.isFlipped === nextProps.isFlipped &&
      prevProps.isMatched === nextProps.isMatched &&
      prevProps.card.iconIndex === nextProps.card.iconIndex
    );
  });

  if (levelConfigs.length === 0 || isSessionLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse font-medium text-muted-foreground">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  const levelConfig = levelConfigs[currentLevel];

  return (
    <GameLayout gameId={6}>
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20 bg-[var(--background)]">
        <motion.div
          className="w-full max-w-3xl px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Game header */}
          <div className="text-center mb-4 sm:mb-8">
            <p className="text-xl font-bold text-primary">Level {currentLevel + 1} / {levelConfigs.length}</p>
          </div>

          {/* Game info cards */}
          <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-4 sm:mb-8">
            <StatCard
              value={isStarted ? `${timeLeft}s` : `${levelConfig.timeLimit}s`}
              icon={AlarmClock}
              className="border-primary/20"
              colorClass={!isStarted ? "text-muted-foreground" : timeLeft > 20 ? "text-primary" : "text-destructive animate-pulse"}
            />

            <StatCard
              label="Số bước"
              value={moves}
              className="border-accent/30"
            />

            <StatCard
              label="Điểm"
              value={totalScore}
              className="border-primary/30 text-primary"
            />
          </div>

          <div className="flex flex-row gap-2 mb-4 items-center justify-center">
            <BackToSelectionButton backToSelection={backToSelection} />
            {isStarted && gameStatus === "playing" && (
              <>
                <RoundButton size="small" onClick={() => setIsPaused(true)} className="hover:bg-primary/90 text-[0.8rem] sm:py-2 rounded-md">
                  <Pause className="w-5 h-5" />
                  <span className="hidden min-[375px]:inline ml-1">Tạm dừng</span>
                </RoundButton>
                <RoundButton 
                  size="small" 
                  variant="neutral"
                  onClick={restartCurrentLevel} 
                  className="text-[0.8rem] sm:py-2 rounded-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden min-[375px]:inline ml-1">Chơi lại</span>
                </RoundButton>
              </>
            )}
            {isStarted && gameStatus === "playing" && (
            <RoundButton 
              size="small" 
              variant="primary" 
              onClick={handleSaveAndExit}
              className="text-[0.8rem] sm:py-2 rounded-md"
              disabled={isSessionSaving}
            >
              {isSessionSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="hidden min-[375px]:inline ml-1">Lưu</span>
            </RoundButton>
            )}
            <LoadGameDialog
              open={showLoadDialog}
              onOpenChange={setShowLoadDialog}
              sessions={savedSessions}
              onLoadSession={handleLoadGame}
              onDeleteSession={handleDeleteGame}
              onSaveSession={handleSaveCurrentSession}
              onBack={onGoHome}
              onNewGame={() => startGameSession()}
            >
              <RoundButton 
                size="small" 
                variant="neutral" 
                onClick={() => {
                  fetchSavedSessions();
                  setShowLoadDialog(true);
                }} 
                className="text-xs py-1.5 px-3 rounded-lg"
            >
              <Download className="mr-1.5" /> Tải
            </RoundButton>
            </LoadGameDialog> 
            <GameInstructions gameType="memory" />
          </div>

          {/* Game board */}
          <motion.div
            className="bg-card rounded-2xl p-2 sm:p-6 shadow-lg border-2 border-primary/10 mb-4 sm:mb-8 flex justify-center overflow-x-auto relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div 
              className={`grid`}
              style={{
                gridTemplateColumns: `repeat(${getResponsiveColumns(levelConfig.pairs * 2)}, auto)`,
                gap: `${window.innerWidth < 640 ? 4 : window.innerWidth < 768 ? 6 : 8}px`,
                justifyContent: 'center'
              }}
            >
              {cards.map((card, idx) => (
                <CardComponent
                  key={idx}
                  card={card}
                  isFlipped={isStarted && (flipped.includes(idx) || matched.includes(idx))}
                  isMatched={isStarted && matched.includes(idx)}
                  onClick={() => handleCardFlip(idx)}
                />
              ))}
            </div>

            {/* Game Status Overlay */}
            {isStarted && (gameStatus === "completed" || gameStatus === "lost") && (
              <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <GameStatusOverlay 
                  totalScore={totalScore} 
                  gameStatus={gameStatus} 
                  action={gameStatus === "completed" && currentLevel < levelConfigs.length - 1 ? nextLevel : handlePlayAgain}
                  currentLevel={currentLevel}
                  totalLevels={levelConfigs.length}
                  playTime={currentPlayTime}
                />
              </motion.div>
            )}
          </motion.div>

          <div className="mt-8 px-4 max-w-2xl text-center">
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              Tìm và ghép các cặp biểu tượng giống nhau để ghi điểm cao nhất!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <PauseMenu
          onContinue={() => setIsPaused(false)}
          onSaveAndExit={handleSaveAndExit}
          onRestart={handlePlayAgain}
        />
      )}
    </GameLayout>
  );
}
