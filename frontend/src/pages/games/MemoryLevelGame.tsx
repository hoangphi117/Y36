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
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameHeader } from "@/components/games/GameHeader";
import { AlarmClock, History, Play, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToSelectionButton } from "@/components/games/memory/SettingButtons";
import StatCard from "@/components/games/memory/StatCard";
import { GameStatusOverlay } from "@/components/games/memory/GameBoardOverlay";
import { useNavigate } from "react-router-dom";
import calcLevelScore from "@/utils/clacScoreMemoryGame";
import { RoundButton } from "@/components/ui/round-button";
import { convertCardsToBoardState, createSessionSave } from "@/utils/memorySessionHelper";
import type { MemorySessionResponse, MemorySessionSave } from "@/types/memoryGame";
import memoryApi from "@/services/memoryApi";

const ICONS = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, icon11, icon12, icon13, icon14, icon15, icon16];

// Level config: {pairs, timeLimit}
const LEVEL_CONFIG = [
  { pairs: 6, timeLimit: 45 },
  { pairs: 8, timeLimit: 60 },
  { pairs: 10, timeLimit: 70 },
  { pairs: 12, timeLimit: 80 },
  { pairs: 14, timeLimit: 90 },
  { pairs: 16, timeLimit: 100 },
];

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


  // session state type
  // const [session, setSession] = useState<MemorySessionResponse | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load default game session from API
  useEffect(() => {
    const fetchGameSession = async () => {
      const res = await memoryApi.getDetail("memory");
      console.log("check res get detail: ", res);
    };
    fetchGameSession();
  }, []);

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

  // Initialize level mode game
  const initializeLevelGame = () => {
    const levelConfig = LEVEL_CONFIG[currentLevel];
    const newCards = generateCards(levelConfig.pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setGameStatus("playing");
    setTimeLeft(levelConfig.timeLimit);
    setMoves(0);
    setIsStarted(true);
  };

  // Get current game session state
  const getCurrentSessionState = (): MemorySessionSave => {
    const boardState = convertCardsToBoardState(cards, flipped, matched);
    return createSessionSave(
      boardState,
      gameStatus,
      timeLeft,
      currentLevel,
      moves,
      totalScore,
      "level"
    );
  };

  // Save game (can be called to send to API)
  const saveGameSession = async () => {
    const sessionData = getCurrentSessionState();
    console.log("Game session to save:", sessionData);

    const newSession = await memoryApi.startSession(6);
    console.log("check start new session: ", newSession);
    setSessionId(newSession.session.id);
    console.log("check new session Id: ", newSession.session.id);
    return sessionData;
  };

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (!isStarted || gameStatus !== "playing" || flipped.length >= 2 || flipped.includes(cardId) || matched.includes(cardId)) {
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
    if (gameStatus !== "playing" || !isStarted) return;

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
  }, [gameStatus, isStarted]);

  // Check level completion
  useEffect(() => {
    if (gameStatus !== "playing" || matched.length === 0) return;

    const levelConfig = LEVEL_CONFIG[currentLevel];
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
  }, [matched, currentLevel, gameStatus, timeLeft]);

  // Initialize game on mount
  useEffect(() => {
    const levelConfig = LEVEL_CONFIG[currentLevel];
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
    if (currentLevel < LEVEL_CONFIG.length - 1) {
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

  // Render card component
  const CardComponent = ({ cardId, card, isFlipped, isMatched, onClick }: any) => (
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

  const levelConfig = LEVEL_CONFIG[currentLevel];

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
            <p className="text-muted-foreground text-sm sm:text-lg">Level {currentLevel + 1} / {LEVEL_CONFIG.length}</p>
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
            {isStarted && (
              <RoundButton size="small"  onClick={restartGame} className="hover:bg-primary/90 text-[0.8rem] sm:py-2 rounded-md">
                <RefreshCcw className="w-5 h-5" />
                <span className="hidden min-[375px]:inline ml-1">Chơi lại</span>
              </RoundButton>
            )}
            {isStarted && (
              <RoundButton size="small" onClick={saveGameSession} className="hover:bg-primary/90 text-[0.8rem] sm:py-2 rounded-md">
                Lưu
              </RoundButton>
            )}
            <RoundButton
              size="small"
              className="hover:bg-primary/90 text-[0.8rem] sm:py-2 rounded-md"
            >
              <History className="w-5 h-5" />
              <span className="hidden min-[375px]:inline ml-1">Lịch sử</span>
            </RoundButton>
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

            {/* Configuration Overlay - Before Game Starts */}
            {!isStarted && (
            <motion.div
                className="absolute flex flex-col inset-0 bg-background/40 backdrop-blur-[2px] rounded-2xl items-center justify-center gap-3 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.button
                  onClick={initializeLevelGame}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex flex-col items-center"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.5)] mb-2 group-hover:bg-primary/90 transition-colors">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1 fill-current" />
                    </div>
                    <span className="font-black text-primary text-lg sm:text-xl uppercase italic">Bắt đầu ngay</span>
                </motion.button>
              </motion.div>
            )}

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
    </>
  );
}
