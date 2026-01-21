import { useRef } from "react";
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
  // Ref để lưu index cũ, giúp tính toán hướng di chuyển
  const prevIndexRef = useRef(selectedIndex);
  
  // Tính toán direction: 1 (Next) hoặc -1 (Back)
  // Logic này xử lý cả trường hợp vòng lặp (VD: từ 0 -> cuối là Back, từ cuối -> 0 là Next)
  const getDirection = () => {
    const prev = prevIndexRef.current;
    const current = selectedIndex;
    const length = games.length;

    // Cập nhật ref cho lần render sau
    // Lưu ý: Việc update ref không gây re-render, an toàn để dùng tính logic ngay tại đây
    if (prev !== current) {
       prevIndexRef.current = current;
    }

    if (prev === current) return 0;

    // Trường hợp đặc biệt: Vòng lặp
    if (prev === length - 1 && current === 0) return 1; // Đang ở cuối bấm Next về đầu
    if (prev === 0 && current === length - 1) return -1; // Đang ở đầu bấm Back về cuối

    // Trường hợp bình thường
    return current > prev ? 1 : -1;
  };

  const direction = getDirection();

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%", // Next: vào từ phải. Back: vào từ trái
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
      rotateY: direction > 0 ? 20 : -20, // Nghiêng nhẹ theo hướng đi vào
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        delay: 0.1 // Chờ một chút để card cũ bắt đầu exit trước khi card mới vào vị trí chính
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      // Khi exit, hướng ngược lại: 
      // Nếu đang Next (dir > 0) -> Card cũ trôi về bên trái (-100%)
      // Nếu đang Back (dir < 0) -> Card cũ trôi về bên phải (100%)
      x: direction < 0 ? "100%" : "-100%", 
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? -20 : 20,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const selectedGame = games[selectedIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[450px] flex items-center justify-center [perspective:2000px] overflow-hidden">
      <AnimatePresence 
        initial={false} 
        mode="popLayout" 
        custom={direction} // Truyền direction vào đây để variants đọc được
      >
        {games.length > 0 && (
          <motion.div
            key={selectedIndex} // Dùng index làm key để React nhận biết sự thay đổi
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 25 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                // Swipe Left -> Next
                onSelect((selectedIndex + 1) % games.length);
              } else if (swipe > swipeConfidenceThreshold) {
                // Swipe Right -> Back
                onSelect((selectedIndex - 1 + games.length) % games.length);
              }
            }}
            className={cn(
               // Thêm absolute để đảm bảo card vào và card ra nằm chồng lên nhau đúng vị trí
               "absolute top-1/2 -translate-y-1/2 w-[280px] md:w-[320px] cursor-grab active:cursor-grabbing touch-none",
               !selectedGame.is_active && "grayscale brightness-75"
            )}
          >
            <div className="relative hover:scale-[1.02] transition-transform duration-300">
              <GameCard
                 title={selectedGame.name}
                 image={selectedGame.image_url}
                 variant={(selectedGame as any).variant || "primary"} 
                 className="h-[400px]" // Tăng chiều cao một chút cho cân đối
              />
              
              {!selectedGame.is_active && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 rounded-[2rem] backdrop-blur-[1px]">
                   <div className="bg-destructive text-white p-4 rounded-full shadow-lg">
                     <Lock className="w-8 h-8" />
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute -bottom-0 flex gap-3 z-20">
        {games.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === selectedIndex 
                ? "bg-primary w-8" 
                : "bg-primary/40 w-2 hover:bg-primary/40"
            )}
          />
        ))}
      </div>
    </div>
  );
};