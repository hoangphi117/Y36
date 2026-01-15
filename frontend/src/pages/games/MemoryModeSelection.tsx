import { GameHeader } from "@/components/games/GameHeader";
import { motion } from "framer-motion";
import { LevelModeCard, FreeModeCard } from "@/components/games/memory/GameModeCard";
import { useNavigate } from "react-router-dom";

export default function MemoryModeSelection() {
  const navigate = useNavigate();

  const startLevelMode = () => {
    navigate("/memory-level");
  };

  const startFreeMode = () => {
    navigate("/memory-free");
  };

  return (
    <>
      <GameHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20 bg-[var(--background)]">
        <motion.div
          className="w-full max-w-2xl px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-black text-primary mb-1 sm:mb-2">CỜ TRÍ NHỚ</h1>
            <p className="text-muted-foreground text-sm sm:text-lg">Chọn chế độ chơi</p>
          </div>

          {/* Level Mode Card */}
          <LevelModeCard startLevelMode={startLevelMode} />

          {/* Divider */}
          <div className="relative mb-4 sm:mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-primary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--background)] px-4 text-muted-foreground font-semibold"></span>
            </div>
          </div>

          {/* Free Mode Card */}
          <FreeModeCard 
            startFreeMode={startFreeMode}
          />
        </motion.div>
      </div>
    </>
  );
}
