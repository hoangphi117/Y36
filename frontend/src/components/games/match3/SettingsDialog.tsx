import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RoundButton } from "@/components/ui/round-button";
import { GameBoardConfig, GameMode, TimeAndRoundsConfig } from "./GameSettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameMode: "time" | "rounds" | "endless";
  setGameMode: (mode: "time" | "rounds" | "endless") => void;
  timeLimit: number;
  setTimeLimit: (time: number) => void;
  targetMatches: number;
  setTargetMatches: (matches: number) => void;
  numCandyTypes: number;
  setNumCandyTypes: (types: number) => void;
  boardSize: number;
  setBoardSize: (size: number) => void;
  onApply: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  gameMode,
  setGameMode,
  timeLimit,
  setTimeLimit,
  targetMatches,
  setTargetMatches,
  numCandyTypes, 
  setNumCandyTypes,
  boardSize,
  setBoardSize,
  onApply,
}: SettingsDialogProps) {
  const handleApply = () => {
    // Đóng dialog trước để các state updates được flush
    onOpenChange(false);
    // Chờ một chút để đảm bảo state đã được update
    setTimeout(() => {
      onApply();
    }, 50);
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
          {/* Game Mode Selection */}
          <GameMode gameMode={gameMode} setGameMode={setGameMode} />

          {/* Time and Rounds Settings - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Time Settings */}
            <TimeAndRoundsConfig
              gameMode={gameMode}
              setTimeLimit={setTimeLimit}
              setTargetMatches={setTargetMatches}
              timeLimit={timeLimit}
              targetMatches={targetMatches}
              defaultTimeLimit={30}
              defaultTargetMatches={10}
            />

            {/* Board Settings */}
            <GameBoardConfig
              numCandyTypes={numCandyTypes}
              setNumCandyTypes={setNumCandyTypes}
              boardSize={boardSize}
              setBoardSize={setBoardSize}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <RoundButton
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </RoundButton>
          <RoundButton variant="primary" onClick={handleApply}>
            Áp dụng & Chơi mới
          </RoundButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
