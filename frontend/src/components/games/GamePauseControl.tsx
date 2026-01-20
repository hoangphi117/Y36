import { Pause, Play, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button"; // Dùng lại nút tròn của bạn
import { Button } from "@/components/ui/button";

interface GamePauseControlProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onQuit: () => void;
  gameName?: string;
}

export function GamePauseControl({
  isPaused,
  onTogglePause,
  onQuit,
}: GamePauseControlProps) {
  return (
    <>
      {/* 1. Nút Pause nhỏ hiển thị trên thanh công cụ */}
      <RoundButton
        variant="neutral"
        size="small"
        onClick={onTogglePause}
        title={isPaused ? "Tiếp tục" : "Tạm dừng"}
        className={
          isPaused ? "bg-yellow-100 text-yellow-600 border-yellow-300" : ""
        }
      >
        {isPaused ? (
          <Play className="w-5 h-5 fill-current" />
        ) : (
          <Pause className="w-5 h-5" />
        )}
      </RoundButton>

      {/* 2. Màn hình phủ (Overlay) khi Pause */}
      <AnimatePresence>
        {isPaused && (
          <div className="absolute inset-0 z-[50] flex items-center justify-center">
            {/* Backdrop làm mờ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={onTogglePause} // Bấm ra ngoài để resume
            />

            {/* Modal Menu */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-card border-2 border-primary/20 p-8 rounded-3xl shadow-2xl w-[90%] max-w-sm text-center space-y-6"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pause className="w-8 h-8 text-background" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Đang tạm dừng
                </h2>
                <p className="text-muted-foreground text-sm">
                  Thời gian đang dừng lại. Bạn đã sẵn sàng chơi tiếp chưa?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full gap-2 font-bold text-lg h-12 rounded-xl"
                  onClick={onTogglePause}
                  sound={true}
                >
                  <Play className="w-5 h-5 fill-current" /> Tiếp tục chơi
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                  onClick={onQuit}
                  sound={true}
                >
                  <LogOut className="w-5 h-5" /> Thoát game
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
