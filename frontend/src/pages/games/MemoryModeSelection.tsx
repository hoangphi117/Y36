import { useState } from "react";
import { motion } from "framer-motion";
import { LevelModeCard, FreeModeCard } from "@/components/games/memory/GameModeCard";
import MemoryLevelGame from "./MemoryLevelGame";
import MemoryFreeGame from "./MemoryFreeGame";

export default function MemoryModeSelection({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<'menu' | 'level' | 'free'>('menu');

  if (mode === 'level') {
    return <MemoryLevelGame onBack={() => setMode('menu')} onGoHome={onBack} />;
  }

  if (mode === 'free') {
    return <MemoryFreeGame onBack={() => setMode('menu')} />;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pt-2 sm:pt-0 bg-[var(--background)]">
        <motion.div
          className="w-full max-w-2xl px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-12 px-4 relative">
             <p className="text-xl font-bold text-primary">Chọn chế độ chơi</p>
          </div>

          {/* Level Mode Card */}
          <LevelModeCard startLevelMode={() => setMode('level')} />

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
            startFreeMode={() => setMode('free')}
          />
        </motion.div>
      </div>
    </>
  );
}
