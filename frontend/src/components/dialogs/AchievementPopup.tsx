// src/components/achievements/AchievementPopup.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { useAchievementStore } from "@/stores/useAchievementStore";

export function AchievementPopup() {
  const { queue, removeFirst } = useAchievementStore();

  // Lấy thành tựu đầu tiên trong hàng đợi để hiển thị
  const currentAchievement = queue[0];

  useEffect(() => {
    if (currentAchievement) {
      // Thiết lập thời gian hiển thị là 5 giây
      const timer = setTimeout(() => {
        removeFirst(); // Sau 5s, xóa khỏi queue để đóng popup hoặc hiện cái tiếp theo
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentAchievement, removeFirst]);

  return (
    <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
      <AnimatePresence mode="wait">
        {currentAchievement && (
          <motion.div
            key={currentAchievement.id || currentAchievement.code} // Quan trọng: Dùng key để AnimatePresence nhận diện sự thay đổi
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="
              bg-card border-2 border-yellow-500/50 shadow-2xl rounded-2xl p-4 
              flex items-center gap-4 w-80 pointer-events-auto
              bg-gradient-to-r from-card to-yellow-500/10
            "
          >
            {/* Icon Box */}
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-yellow-500 p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.4)]"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 border border-yellow-500">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              </div>
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                Thành tựu mới!
              </p>
              <h4 className="font-black text-sm truncate uppercase tracking-tight">
                {currentAchievement.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentAchievement.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
