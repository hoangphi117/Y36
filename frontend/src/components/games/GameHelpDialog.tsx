import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Game } from "@/types/game";

interface GameHelpDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GameHelpDialog = ({ game, open, onOpenChange }: GameHelpDialogProps) => {
  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-center text-primary">
            Hướng dẫn: {game.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full p-4 rounded-md border bg-muted/50">
          <div className="prose dark:prose-invert max-w-none">
            {/* Nếu API trả về Markdown, có thể cần render markdown tại đây. 
                Tạm thời hiển thị text thuần hoặc pre-wrap */}
            <div className="whitespace-pre-wrap font-medium text-foreground/90 leading-relaxed">
              {game.help_content || "Chưa có hướng dẫn cho trò chơi này."}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
