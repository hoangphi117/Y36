import { useState, useEffect } from "react";
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
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { type OptionItem } from "@/config/gameConfigs";

export type Difficulty = "easy" | "medium" | "hard";

interface GameSettingsDialogProps {
  // Các giá trị hiện tại (Optional để linh hoạt cho nhiều game)
  currentDifficulty?: Difficulty;
  currentTimeLimit?: number;
  currentTurnTime?: number;
  currentBoardSize?: number;
  currentSpeed?: number;
  currentIncrement?: number;

  // Các danh sách tùy chọn
  timeOptions?: OptionItem[];
  boardSizeOptions?: OptionItem[];
  speedOptions?: OptionItem[];
  incrementOptions?: OptionItem[];

  // Hàm save trả về tất cả thông số
  onSave: (
    difficulty: Difficulty,
    timeLimit: number,
    turnTime: number,
    boardSize: number,
    speed: number,
    increment: number
  ) => void;

  disabled?: boolean;
}

export function GameSettingsDialog({
  // Default values để tránh lỗi undefined khi khởi tạo state
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
}: GameSettingsDialogProps) {
  const [open, setOpen] = useState(false);

  // State tạm thời để chỉnh sửa trên UI
  const [tempDifficulty, setTempDifficulty] =
    useState<Difficulty>(currentDifficulty);
  const [tempTimeLimit, setTempTimeLimit] = useState<number>(currentTimeLimit);
  const [tempTurnTime, setTempTurnTime] = useState<number>(currentTurnTime);
  const [tempBoardSize, setTempBoardSize] = useState<number>(currentBoardSize);
  const [tempSpeed, setTempSpeed] = useState<number>(currentSpeed);
  const [tempIncrement, setTempIncrement] = useState<number>(currentIncrement);

  // Reset state về giá trị hiện tại mỗi khi mở Dialog
  useEffect(() => {
    if (open) {
      setTempDifficulty(currentDifficulty);
      setTempTimeLimit(currentTimeLimit);
      setTempTurnTime(currentTurnTime);
      setTempBoardSize(currentBoardSize);
      setTempSpeed(currentSpeed);
      setTempIncrement(currentIncrement);
    }
  }, [
    open,
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
      tempIncrement
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" /> Cài đặt Game
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          {/* 1. Độ khó AI (Chỉ hiện khi game có prop currentDifficulty được truyền vào - vd: Snake không truyền) */}
          {/* Lưu ý: Check props từ parent truyền xuống, ở đây ta check gián tiếp qua việc
              component cha có truyền giá trị khác undefined hay không */}
          {/* Tuy nhiên do ta đã gán default value ở trên, nên ta cần logic check khác hoặc chấp nhận hiện mặc định.
              Cách tốt nhất: Logic hiển thị dựa trên game type hoặc check options. 
              Ở đây giả sử nếu game không dùng AI thì ta bỏ qua, nhưng TicTacToe/Caro đều dùng.
              Để đơn giản: Nếu speedOptions có dữ liệu (Game Snake) thì ẩn Difficulty (trừ khi Snake có AI).
          */}
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

          {/* 2. Kích thước bàn cờ */}
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

          {/* 3. Tốc độ ban đầu (Chỉ cho Snake) */}
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

          {/* 4. Tốc độ tăng dần (Chỉ cho Snake) */}
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

          {/* 5. Thời gian mỗi lượt (Chỉ cho Caro/TicTacToe - ẩn nếu là Snake) */}
          {/* Logic: Nếu KHÔNG phải game có speed options (Snake) thì hiện Turn Time */}
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

          {/* 6. Tổng thời gian (Chung cho tất cả) */}
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

        <DialogFooter>
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="w-4 h-4" /> Lưu & Chơi lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
