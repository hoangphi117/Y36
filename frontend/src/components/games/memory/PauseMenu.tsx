import { RoundButton } from "@/components/ui/round-button";
import { motion } from "framer-motion";
import { Play, Save, RotateCcw } from "lucide-react";

interface PauseMenuProps {
  onContinue: () => void;
  onSaveAndExit: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onContinue, onSaveAndExit, onRestart }: PauseMenuProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card rounded-2xl p-8 shadow-2xl border-2 border-primary/30 max-w-sm w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="text-3xl font-black text-primary mb-8 text-center">TẠM DỪNG</h2>

        <div className="flex flex-col gap-4">
          {/* Continue Button */}
          <RoundButton
            onClick={onContinue}
            className="flex items-center justify-center gap-3 w-full p-4 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <Play className="w-6 h-6 ml-1 fill-current" />
            Tiếp tục chơi
          </RoundButton>
          {/* Save and Exit Button */}
          <RoundButton
            onClick={onSaveAndExit}
            className="flex items-center justify-center gap-3 w-full p-4 bg-accent text-accent-foreground rounded-lg font-bold text-sm hover:bg-accent/90 transition-colors"
          >
            <Save className="w-6 h-6" />
            Lưu và thoát
          </RoundButton>

          {/* Restart Button */}
          <RoundButton
            onClick={onRestart}
            className="flex items-center justify-center gap-3 w-full p-4 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm hover:bg-destructive/90 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
            Chơi lại từ đầu
          </RoundButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
