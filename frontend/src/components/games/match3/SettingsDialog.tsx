import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RoundButton } from "@/components/ui/round-button";
import { GameBoardConfig, GameMode, TimeAndRoundsConfig } from "./GameSettings";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Cài đặt trò chơi
          </DialogTitle>
        </DialogHeader>

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

        <DialogFooter className="flex gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
