import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Trophy, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type GameSession } from "@/types/game";
import { RoundButton } from "../ui/round-button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";

interface LoadGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: GameSession[];
  currentSessionId?: string;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onSaveSession?: () => void;
  children: React.ReactNode;
}

export function LoadGameDialog({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  onSaveSession,
  children,
}: LoadGameDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const handleLoadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      // Chỉ lưu session hiện tại nếu nó đã tồn tại trong danh sách sessions
      if (onSaveSession && currentSessionId) {
        const sessionExists = sessions.some(s => s.id === currentSessionId);
        if (sessionExists) {
          await onSaveSession();
        }
      }
      onLoadSession(sessionId);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Bạn có ván đã lưu!
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              Chọn một ván đã lưu để tiếp tục chơi hoặc bắt đầu ván mới.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      "text-left",
                      currentSessionId === session.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleLoadSession(session.id)}
                        disabled={isLoading}
                        className="flex-1 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">
                              Điểm: {session.score || 0}
                            </span>
                            {isLoading && (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(session.play_time_seconds)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(session.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                      {onDeleteSession && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          title="Xóa ván chơi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex flex-row gap-2 sm:gap-2 justify-end mt-2">
            <RoundButton
              onClick={() => onOpenChange(false)}
              variant="accent"
              size="small"
              className="rounded-md"
              disabled={isLoading}
            >
              hủy
            </RoundButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
