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
import { Infinity as InfynityIcon, Play, Settings2, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToSelectionButton, RefreshGameButton } from "@/components/games/memory/SettingButtons";
import StatCard from "@/components/games/memory/StatCard";
import { GameStatusOverlay } from "@/components/games/memory/GameBoardOverlay";
import { useNavigate } from "react-router-dom";
import { RoundButton } from "@/components/ui/round-button";
import SettingDialog from "@/components/games/memory/SettingDialog";
import { convertCardsToBoardState, createSessionSave } from "@/utils/memorySessionHelper";
import type { MemorySessionSave } from "@/types/memoryGame";
import { PauseMenu } from "@/components/games/memory/PauseMenu";

const ICONS = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, icon11, icon12, icon13, icon14, icon15, icon16];

interface Card {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type GameStatus = "playing" | "completed" | "lost";

export default function MemoryFreeGame() {
  const navigate = useNavigate();

  // Game state
  const [freePairs, setFreePairs] = useState(6);
  const [freeTime, setFreeTime] = useState(60);
  const [freeCards, setFreeCards] = useState<Card[]>([]);
  const [freeFlipped, setFreeFlipped] = useState<number[]>([]);
  const [freeMatched, setFreeMatched] = useState<number[]>([]);
  const [freeTimeLeft, setFreeTimeLeft] = useState(0);
  const [freeGameStatus, setFreeGameStatus] = useState<GameStatus>("playing");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [configPairs, setConfigPairs] = useState(6);
  const [configTime, setConfigTime] = useState(60);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

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

  // Initialize free mode game
  const initializeFreeGame = () => {
    const newCards = generateCards(freePairs);
    setFreeCards(newCards);
    setFreeFlipped([]);
    setFreeMatched([]);
    setFreeGameStatus("playing");
    setFreeTimeLeft(freeTime);
    setIsStarted(true);
  };

  // Handle card flip
  const handleFreeCardFlip = (cardId: number) => {
    if (!isStarted || freeGameStatus !== "playing" || freeFlipped.length >= 2 || freeFlipped.includes(cardId) || freeMatched.includes(cardId) || isPaused) {
      return;
    }

    const newFlipped = [...freeFlipped, cardId];
    setFreeFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (freeCards[first].iconIndex === freeCards[second].iconIndex) {
        setFreeMatched([...freeMatched, first, second]);
        setFreeFlipped([]);
      } else {
        setTimeout(() => setFreeFlipped([]), 600);
      }
    }
  };

  // Timer for free mode
  useEffect(() => {
    if (freeGameStatus !== "playing" || !isStarted || isPaused) return;
    if (freeTime === 0) return; 

    const timer = setInterval(() => {
      setFreeTimeLeft((t) => {
        if (t <= 1) {
          setFreeGameStatus("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [freeGameStatus, freeTime, isStarted, isPaused]);

  // Check free mode completion
  useEffect(() => {
    if (freeGameStatus !== "playing" || freeMatched.length === 0) return;

    if (freeMatched.length === freePairs * 2) {
      setFreeGameStatus("completed");
    }
  }, [freeMatched, freePairs, freeGameStatus]);

  // Initialize game on mount
  useEffect(() => {
    const newCards = generateCards(configPairs);
    setFreeCards(newCards);
    setFreePairs(configPairs);
    setFreeTime(configTime);
    setFreeTimeLeft(configTime);
  }, []);

  // Reset to mode selection
  const backToSelection = () => {
    navigate("/memory");
  };

  // Restart free mode game
  const restartFreeGame = () => {
    setIsStarted(false);
    setIsPaused(false);
    setFreePairs(configPairs);
    setFreeTime(configTime);
    const newCards = generateCards(configPairs);
    setFreeCards(newCards);
    setFreeFlipped([]);
    setFreeMatched([]);
    setFreeGameStatus("playing");
    setFreeTimeLeft(configTime);
  };

  // Handle pause menu - save and exit
  const handleSaveAndExit = () => {
    try {
      // Save game session
      saveGameSession();
      // Navigate back to selection
      navigate("/memory");
    } catch (error) {
      console.error("Error saving game:", error);
      // Still navigate back even if save fails
      navigate("/memory");
    }
  };

  // Calculate responsive columns
  const getResponsiveColumns = (totalCards: number): number => {
    if (typeof window === "undefined") return 4;
    
    const screenWidth = window.innerWidth;
    const cardSizeWithGap = screenWidth < 768 ? 56 + 6 : 80 + 10;
    const availableWidth = screenWidth - 40;
    const maxColumns = Math.floor(availableWidth / cardSizeWithGap);
    
    const idealColumns = Math.ceil(Math.sqrt(totalCards));
    
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
          ? "cursor-not-allowed bg-muted" 
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

  // Main Game Render
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
            <p className="text-muted-foreground text-sm sm:text-lg">Chế độ tự do - Luyện tập</p>
          </div>

          {/* Game info cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-8">
            {/* time left */}
            <StatCard
              label="Thời gian"
              value={isStarted && freeTime === 0 ? "" : isStarted ? `${freeTimeLeft}s` : `${freeTime}s`}
              icon={freeTime === 0 ? InfynityIcon : undefined}
              className="border-primary/20"
              colorClass={
                freeTime === 0 
                  ? "text-primary" 
                  : !isStarted ? "text-muted-foreground" : freeTimeLeft > 10 ? "text-primary" : "text-destructive animate-pulse"
              }
            />
            {/* pairs */}
            <StatCard
              label="Số cặp"
              value={freePairs}
              className="border-accent/30"
              colorClass="text-accent"
            />
          </div>

          {/* Setting buttons */}
          <div className="flex flex-row gap-2 sm:gap-3 items-center justify-start mb-3">
            <BackToSelectionButton backToSelection={backToSelection} />
            { isStarted &&  freeGameStatus === "playing" && <RefreshGameButton restartGame={initializeFreeGame} />}
            {/* {isStarted && freeGameStatus === "playing" && (
              <RoundButton 
                size="small"
                className="rounded-md"
                onClick={() => setIsPaused(true)}
              >
                <Pause className="w-5 h-5" />
                <span className="hidden min-[375px]:inline ml-1">Tạm dừng</span>
              </RoundButton>
            )} */}
            <RoundButton 
                size="small"
                className="rounded-md"
                onClick={() => {
                setConfigPairs(freePairs);
                setConfigTime(freeTime);
                setIsConfigDialogOpen(true);
              }} 
            >
                <Settings2 />
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
                gridTemplateColumns: `repeat(${getResponsiveColumns(freePairs * 2)}, auto)`,
                gap: `${window.innerWidth < 640 ? 4 : window.innerWidth < 768 ? 6 : 8}px`,
                justifyContent: 'center'
              }}
            >
              {freeCards.map((card, idx) => (
                <CardComponent
                  key={idx}
                  cardId={idx}
                  card={card}
                  isFlipped={isStarted && (freeFlipped.includes(idx) || freeMatched.includes(idx))}
                  isMatched={isStarted && freeMatched.includes(idx)}
                  onClick={() => handleFreeCardFlip(idx)}
                />
              ))}
            </div>

            {/* Configuration Overlay - Before Game Starts */}
            {!isStarted && (
              <motion.div
                className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  onClick={initializeFreeGame}
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
            {isStarted && (freeGameStatus === "completed" || freeGameStatus === "lost") && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-black/70 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <GameStatusOverlay 
                  totalScore={freeGameStatus === "completed" ? 100 + freeTimeLeft : 0} 
                  gameStatus={freeGameStatus === "completed" ? "freeCompleted" : freeGameStatus} 
                  action={initializeFreeGame} 
                />
              </motion.div>
            )}
          </motion.div>

          {/* Configuration Dialog */}
          {isConfigDialogOpen && (
            <SettingDialog 
                setFreePairs={setFreePairs}
                setFreeTime={setFreeTime}
                setFreeTimeLeft={setFreeTimeLeft}
                setFreeCards={setFreeCards}
                setFreeFlipped={setFreeFlipped}
                setFreeMatched={setFreeMatched}
                setFreeGameStatus={setFreeGameStatus}
                setIsConfigDialogOpen={setIsConfigDialogOpen}
                setIsStarted={setIsStarted}
                generateCards={generateCards}
                freePairs={freePairs}
                freeTime={freeTime}
            />
          )}
        </motion.div>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <PauseMenu
          onContinue={() => setIsPaused(false)}
          onSaveAndExit={handleSaveAndExit}
          onRestart={handleRestartFromPause}
        />
      )}
    </>
  );
}
