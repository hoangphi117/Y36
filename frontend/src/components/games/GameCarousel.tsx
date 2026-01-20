import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import type { Game } from "@/types/game";
import { GameCard } from "@/components/games/GameCard";
import { cn } from "@/lib/utils";

interface GameCarouselProps {
  games: Game[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const GameCarousel = ({ games, selectedIndex, onSelect }: GameCarouselProps) => {
  // variants cho animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const selectedGame = games[selectedIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[400px] flex items-center justify-center perspective-[2000px]">
      <AnimatePresence initial={false} mode="popLayout" custom={1}>
        {games.length > 0 && (
          <motion.div
            key={selectedGame.id}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                onSelect((selectedIndex + 1) % games.length);
              } else if (swipe > swipeConfidenceThreshold) {
                onSelect((selectedIndex - 1 + games.length) % games.length);
              }
            }}
            className={cn(
               "absolute w-[260px] md:w-[300px] cursor-grab active:cursor-grabbing will-change-transform",
               !selectedGame.is_active && "grayscale brightness-75"
            )}
          >
            <div className="relative">
              <GameCard
                 title={selectedGame.name}
                 image={selectedGame.image_url}
                 variant={(selectedGame as any).variant || "primary"} 
                 className="shadow-2xl h-[380px]"
                 // onClick không cần thiết vì ta có nút ENTER riêng
              />
              
              {!selectedGame.is_active && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 rounded-[2.5rem] backdrop-blur-[2px]">
                   <div className="bg-destructive/90 text-white p-4 rounded-full shadow-lg animate-bounce">
                     <Lock className="w-8 h-8" />
                   </div>
                   <p className="mt-4 text-white font-black text-2xl uppercase tracking-widest drop-shadow-md border-2 border-white px-4 py-1 rounded-lg">
                     LOCKED
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hiển thị các chấm chỉ số (Indicators) */}
      <div className="absolute -bottom-3 flex gap-2 z-20">
        {games.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              idx === selectedIndex 
                ? "bg-primary w-8" 
                : "bg-muted-foreground/30 hover:bg-primary/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
