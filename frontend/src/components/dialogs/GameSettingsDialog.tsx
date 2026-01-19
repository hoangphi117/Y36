import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Settings,
  BrainCircuit,
  Hourglass,
  Save,
  Grid3X3,
  Timer,
  Zap,
  Gauge,
  X,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { type OptionItem } from "@/config/gameConfigs";
import { cn } from "@/lib/utils";

export type Difficulty = "easy" | "medium" | "hard";

interface GameSettingsDialogProps {
  currentDifficulty?: Difficulty;
  currentTimeLimit?: number;
  currentTurnTime?: number;
  currentBoardSize?: number;
  currentSpeed?: number;
  currentIncrement?: number;

  timeOptions?: OptionItem[];
  boardSizeOptions?: OptionItem[];
  speedOptions?: OptionItem[];
  incrementOptions?: OptionItem[];

  onSave: (
    difficulty: Difficulty,
    timeLimit: number,
    turnTime: number,
    boardSize: number,
    speed: number,
    increment: number,
  ) => void;

  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Biến để chặn đóng bảng
  preventClose?: boolean;
  
  // Chế độ inline - hiển thị trong vùng game board thay vì modal toàn màn hình
  inline?: boolean;
}

export function GameSettingsDialog({
  currentDifficulty = "medium",
  currentTimeLimit = 0,
  currentTurnTime = 0,
  currentBoardSize = 15,
  currentSpeed = 200,
  currentIncrement = 10,

  timeOptions = [],
  boardSizeOptions = [],
  speedOptions = [],
  incrementOptions = [],

  onSave,
  disabled,
  open: externalOpen,
  onOpenChange: setExternalOpen,

  // Default là false (cho phép đóng bình thường)
  preventClose = false,
  // Chế độ inline - mặc định false (modal toàn màn hình)
  inline = false,
}: GameSettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen =
    externalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const [tempDifficulty, setTempDifficulty] =
    useState<Difficulty>(currentDifficulty);
  const [tempTimeLimit, setTempTimeLimit] = useState<number>(currentTimeLimit);
  const [tempTurnTime, setTempTurnTime] = useState<number>(currentTurnTime);
  const [tempBoardSize, setTempBoardSize] = useState<number>(currentBoardSize);
  const [tempSpeed, setTempSpeed] = useState<number>(currentSpeed);
  const [tempIncrement, setTempIncrement] = useState<number>(currentIncrement);

  useEffect(() => {
    if (isOpen) {
      setTempDifficulty(currentDifficulty);
      setTempTimeLimit(currentTimeLimit);
      setTempTurnTime(currentTurnTime);
      setTempBoardSize(currentBoardSize);
      setTempSpeed(currentSpeed);
      setTempIncrement(currentIncrement);
    }
  }, [
    isOpen,
    currentDifficulty,
    currentTimeLimit,
    currentTurnTime,
    currentBoardSize,
    currentSpeed,
    currentIncrement,
  ]);

  const handleSave = () => {
    onSave(
      tempDifficulty,
      tempTimeLimit,
      tempTurnTime,
      tempBoardSize,
      tempSpeed,
      tempIncrement,
    );
    setIsOpen?.(false);
  };

  // Nội dung settings form (dùng chung cho cả modal và inline)
  const settingsContent = (
    <>
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
        {speedOptions.length === 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" /> Độ khó AI
            </label>
            <Select
              value={tempDifficulty}
              onValueChange={(val) => setTempDifficulty(val as Difficulty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ (Random)</SelectItem>
                <SelectItem value="medium">Vừa (Biết thủ)</SelectItem>
                <SelectItem value="hard">Khó (Minimax)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {boardSizeOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-primary" /> Kích thước bàn chơi
            </label>
            <Select
              value={tempBoardSize.toString()}
              onValueChange={(val) => setTempBoardSize(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {boardSizeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {speedOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" /> Tốc độ ban đầu
            </label>
            <Select
              value={tempSpeed.toString()}
              onValueChange={(val) => setTempSpeed(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {speedOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {incrementOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" /> Tốc độ tăng dần
            </label>
            <Select
              value={tempIncrement.toString()}
              onValueChange={(val) => setTempIncrement(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {incrementOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {speedOptions.length === 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Thời gian mỗi nước đi
            </label>
            <Select
              value={tempTurnTime.toString()}
              onValueChange={(val) => setTempTurnTime(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Không giới hạn</SelectItem>
                <SelectItem value="15">15 Giây</SelectItem>
                <SelectItem value="30">30 Giây</SelectItem>
                <SelectItem value="60">60 Giây</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {timeOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-primary" /> Tổng thời gian
            </label>
            <Select
              value={tempTimeLimit.toString()}
              onValueChange={(val) => setTempTimeLimit(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" /> Lưu & Chơi Ngay
        </Button>
      </div>
    </>
  );

  // Chế độ inline - hiển thị trong vùng game board
  if (inline) {
    return (
      <AnimatePresence>
        {isOpen && (
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
              className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-2xl w-full max-w-xs relative mx-4"
            >
              {/* Close button (nếu không bị chặn) */}
              {!preventClose && (
                <button
                  onClick={() => setIsOpen?.(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" /> Cài đặt Game
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Chỉ hiện nút Trigger (Icon Setting) nếu KHÔNG ở chế độ bắt buộc (preventClose) 
          và không bị điều khiển từ bên ngoài (controlled) */}
      {externalOpen === undefined && !preventClose && (
        <DialogTrigger asChild>
          <RoundButton
            variant="neutral"
            size="small"
            disabled={disabled}
            title="Cài đặt Game"
          >
            <Settings className="w-5 h-5" />
          </RoundButton>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          "max-w-xs sm:max-w-sm",
          preventClose && "[&>button]:hidden",
        )}
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" /> Cài đặt Game
          </DialogTitle>
        </DialogHeader>

        {settingsContent}
      </DialogContent>
    </Dialog>
  );
}
