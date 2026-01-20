import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RoundButton } from "@/components/ui/round-button";
import { Calendar, Clock, Play, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { type GameSession } from "@/types/game";
import { useNavigate } from "react-router-dom";

interface LoadGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: GameSession[];
  currentSessionId?: string;
  onLoadSession: (sessionId: string) => void;
  onNewGame: () => void;
  onBack?: () => void;
  onSaveSession?: () => void;
  onDeleteSession?: (sessionId: string) => void;
  children: React.ReactNode;
}

export function LoadGameDialog({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  onLoadSession,
  onNewGame,
  onBack,
  onDeleteSession,
  children,
}: LoadGameDialogProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}

      <DialogContent
        className="max-w-md [&>button]:hidden"
        onInteractOutside={(e) => {
          if (sessions) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Ván chơi đã lưu</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4 pr-4">
          <div className="flex flex-col gap-2">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Chưa có ván nào lưu.
              </div>
            ) : (
              sessions.map((s) => (
                <Button
                  key={s.id}
                  variant="outline"
                  className={cn(
                    "flex justify-between items-center h-auto py-3 px-4",
                    currentSessionId === s.id && "border-primary bg-primary/5",
                  )}
                  onClick={() => onLoadSession(s.id)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-bold flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(s.updated_at).toLocaleString("vi-VN")}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {formatTime(s.play_time_seconds)}s
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    {onDeleteSession && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(s.id);
                        }}
                      >
                        <Plus className="w-4 h-4 rotate-45" /> 
                      </Button>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2 items-center sm:justify-between">
          <RoundButton
            size="small"
            variant="accent"
            onClick={() => {
              if (onBack) onBack();
              else navigate("/");
            }}
            className="flex-1 sm:flex-none gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Quay về Trang Chủ
          </RoundButton>

          <RoundButton
            size="small"
            onClick={() => {
              onOpenChange(false);
              onNewGame();
            }}
            className="flex-1 sm:flex-none gap-2"
          >
            <Plus className="w-4 h-4" /> Game Mới
          </RoundButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
