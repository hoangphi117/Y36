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
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameHeader } from "@/components/games/GameHeader";
import { AlarmClock, History, Play, Pause, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToSelectionButton } from "@/components/games/memory/SettingButtons";
import StatCard from "@/components/games/memory/StatCard";
import { GameStatusOverlay } from "@/components/games/memory/GameBoardOverlay";
import { useNavigate } from "react-router-dom";
import calcLevelScore from "@/utils/clacScoreMemoryGame";
import { RoundButton } from "@/components/ui/round-button";
import { convertCardsToBoardState, createSessionSave, restoreBoardState } from "@/utils/memorySessionHelper";
import type { MemorySessionSave } from "@/types/memoryGame";
import memoryApi from "@/services/memoryApi";
import { PauseMenu } from "@/components/games/memory/PauseMenu";
import SessionHistoryDialog from "@/components/games/memory/SessionHistoryDialog";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { useAuthStore } from "@/stores/useAuthStore";

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

export default function MemoryLevelGame() {
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [levelConfigs, setLevelConfigs] = useState<MemoryLevelConfig[]>([]);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  //session id for saving
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
        setIsStarted(true); // Bắt đầu game ngay lập tức
      }

    }catch (error) {
      console.error("Error loading session:", error);
    }
  }, [session]);

  // Initialize level mode game
  const initializeLevelGame = () => {
    if (levelConfigs.length === 0) return;
    const levelConfig = levelConfigs[currentLevel];
    const newCards = generateCards(levelConfig.pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setGameStatus("playing");
    setTimeLeft(levelConfig.timeLimit);
    setMoves(0);
    setIsStarted(true);
  };

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (!isStarted || gameStatus !== "playing" || flipped.length >= 2 || flipped.includes(cardId) || matched.includes(cardId) || isPaused) {
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
        setTimeout(() => setFlipped([]), 600);
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
    }
  }, [matched, currentLevel, gameStatus, timeLeft, levelConfigs]);

  // Auto complete game when lost or completed
  useEffect(() => {
    if (gameStatus === "lost" || (gameStatus === "completed" && currentLevel === levelConfigs.length - 1)) {
      // Gọi complete game với điểm hiện tại
      completeGameSession(totalScore);
    }
  }, [gameStatus, currentLevel, totalScore, levelConfigs.length]);

  // Initialize game when level changes (chỉ khi chuyển level, không phải khi load session)
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
    navigate("/memory");
  };

  // restart level 1
  const restartGame = () => {
    setIsStarted(false);
    setTotalScore(0);
    setCurrentLevel(0);
    setIsPaused(false);
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
      // Save game session
      await saveGameSession(true);
      // Navigate back to selection
      navigate("/memory");
    } catch (error) {
      console.error("Error saving game:", error);
      // Still navigate back even if save fails
      navigate("/memory");
    }
  };

  // Handle restart from pause menu
  const handleRestartFromPause = () => {
    setIsPaused(false);
    restartGame();
  };

  // load saved game
  const handleLoadGame = async (sessionId: string) => {
    await loadGameSession(sessionId);
  }

  // delete saved game
  const handleDeleteGame = async (sessionId: string) => {
    await memoryApi.deleteSession(sessionId);
    await fetchSavedSessions();
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

  // Auto-save khi rời khỏi trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session && session.status === "playing" && isStarted) {
        // Auto-save session với board state hiện tại
        const currentBoard = getCurrentSessionState();
        const url = `${import.meta.env.VITE_API_BASE_URL}/sessions/${session.id}/save`;
        
        const token = useAuthStore.getState().token;
        const apiKey = import.meta.env.VITE_API_KEY;

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            board_state: currentBoard,
            status: "saved",
          }),
          keepalive: true,
        }).catch((err) => console.error("Auto-save failed:", err));
      }
    };

    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session, isStarted, cards, flipped, matched, currentLevel, moves, totalScore, timeLeft]);

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

  // Render card component
  const CardComponent = ({ card, isFlipped, isMatched, onClick }: any) => (
    <motion.button
      onClick={onClick}
      disabled={isMatched}
      whileHover={!isMatched ? { scale: 1.05 } : {}}
      whileTap={!isMatched ? { scale: 0.95 } : {}}
      className={cn(
        "relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg transition-all cursor-pointer",
        "flex items-center justify-center font-bold text-sm sm:text-xl md:text-2xl",
        "border-2 border-primary/30",
        isMatched 
          ? "opacity-40 cursor-not-allowed bg-muted" 
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

  if (levelConfigs.length === 0) {
    return (
      <>
        <GameHeader />
        <div className="min-h-screen flex items-center justify-center">
          <p>Đang tải...</p>
        </div>
      </>
    );
  }

  const levelConfig = levelConfigs[currentLevel];

  return (
    <>
      <GameHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20 bg-[var(--background)]">
        <motion.div
          className="w-full max-w-3xl px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Game header */}
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-black text-primary mb-1 sm:mb-2">CỜ TRÍ NHỚ</h1>
            <p className="text-muted-foreground text-sm sm:text-lg">Level {currentLevel + 1} / {levelConfigs.length}</p>
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
            <LoadGameDialog
              open={showLoadDialog}
              onOpenChange={setShowLoadDialog}
              sessions={savedSessions}
              onLoadSession={handleLoadGame}
              onDeleteSession={handleDeleteGame}
              onNewGame={startGameSession}
              onSaveSession={handleSaveCurrentSession}
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
              <Download className="w-3.5 h-3.5 mr-1.5" /> 
            </RoundButton>
            </LoadGameDialog>
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
                  cardId={idx}
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
                  action={gameStatus === "completed" ? nextLevel : restartGame}
                  currentLevel={currentLevel}
                />
              </motion.div>
            )}
          </motion.div>
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

      {isHistoryOpen && (
        <SessionHistoryDialog 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          sessions={[]} 
          onLoadSession={() => {}}
        />
      )}
    </>
  );
}
