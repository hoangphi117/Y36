import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import { GameBoardConfig, GameMode, TimeAndRoundsConfig } from "./GameSettings";
import { useState, useEffect } from "react";
import { Loader2, Settings, X } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameMode: "time" | "rounds" | "endless";
  timeLimit: number;
  targetMatches: number;
  numCandyTypes: number;
  boardSize: number;
  onApply: (settings: {
    gameMode: "time" | "rounds" | "endless";
    timeLimit: number;
    targetMatches: number;
    numCandyTypes: number;
    boardSize: number;
  }) => Promise<void>;
  // Chế độ inline - hiển thị trong vùng game board
  inline?: boolean;
}

export function SettingsDialog({
  open,
  onOpenChange,
  gameMode: initialGameMode,
  timeLimit: initialTimeLimit,
  targetMatches: initialTargetMatches,
  numCandyTypes: initialNumCandyTypes,
  boardSize: initialBoardSize,
  onApply,
  inline = false,
}: SettingsDialogProps) {
  // Local states để lưu giá trị tạm
  const [localGameMode, setLocalGameMode] = useState(initialGameMode);
  const [localTimeLimit, setLocalTimeLimit] = useState(initialTimeLimit);
  const [localTargetMatches, setLocalTargetMatches] = useState(initialTargetMatches);
  const [localNumCandyTypes, setLocalNumCandyTypes] = useState(initialNumCandyTypes);
  const [localBoardSize, setLocalBoardSize] = useState(initialBoardSize);
  const [isApplying, setIsApplying] = useState(false);

  // Reset local states khi dialog mở hoặc props thay đổi
  useEffect(() => {
    if (open) {
      setLocalGameMode(initialGameMode);
      setLocalTimeLimit(initialTimeLimit);
      setLocalTargetMatches(initialTargetMatches);
      setLocalNumCandyTypes(initialNumCandyTypes);
      setLocalBoardSize(initialBoardSize);
      setIsApplying(false);
    }
  }, [open, initialGameMode, initialTimeLimit, initialTargetMatches, initialNumCandyTypes, initialBoardSize]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply({
        gameMode: localGameMode,
        timeLimit: localTimeLimit,
        targetMatches: localTargetMatches,
        numCandyTypes: localNumCandyTypes,
        boardSize: localBoardSize,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying settings:", error);
    } finally {
      setIsApplying(false);
    }
  };

  // Nội dung settings form (dùng chung cho cả modal và inline)
  const settingsContent = (
    <>
      <div className="space-y-4">
        <GameMode gameMode={localGameMode} setGameMode={setLocalGameMode} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TimeAndRoundsConfig
            gameMode={localGameMode}
            setTimeLimit={setLocalTimeLimit}
            setTargetMatches={setLocalTargetMatches}
            timeLimit={localTimeLimit}
            targetMatches={localTargetMatches}
            defaultTimeLimit={30}
            defaultTargetMatches={10}
          />

          <GameBoardConfig
            numCandyTypes={localNumCandyTypes}
            setNumCandyTypes={setLocalNumCandyTypes}
            boardSize={localBoardSize}
            setBoardSize={setLocalBoardSize}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 justify-end">
        <RoundButton
          variant="neutral"
          onClick={() => onOpenChange(false)}
          disabled={isApplying}
        >
          Hủy
        </RoundButton>
        <RoundButton 
          variant="primary" 
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang khởi tạo...
            </>
          ) : (
            "Áp dụng & Chơi mới"
          )}
        </RoundButton>
      </div>
    </>
  );

  // Chế độ inline - hiển thị trong vùng game board
  if (inline) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-2xl w-full max-w-md relative mx-4 max-h-[90%] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" /> Cài đặt trò chơi
                </h3>
              </div>

              {settingsContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Chế độ modal (mặc định)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Cài đặt trò chơi
          </DialogTitle>
        </DialogHeader>

        {settingsContent}
      </DialogContent>
    </Dialog>
  );
}
