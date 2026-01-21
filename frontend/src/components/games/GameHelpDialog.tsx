import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Game } from "@/types/game";

import { Info } from "lucide-react";

interface GameHelpDialogProps {
  game: Game | null;
  instructions?: any; // We can improve typing later or import from GameInstructions
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GameHelpDialog = ({ game, instructions, open, onOpenChange }: GameHelpDialogProps) => {
  if (!game) return null;

  // Fallback to game.help_content if instructions not provided
  const content = instructions || {
    title: game.name,
    goal: game.help_content || "Chưa có hướng dẫn cho trò chơi này.",
    controls: [],
    rules: [],
    tips: []
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary text-center justify-center">
            <Info className="w-6 h-6" />
            Hướng dẫn: {content.title || game.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full p-4 rounded-md border bg-muted/50">
          <div className="space-y-4 text-sm sm:text-base">
            {content.goal && (
              <section>
                <h4 className="font-semibold text-primary mb-2 text-lg">Mục tiêu</h4>
                <p className="text-muted-foreground font-medium">{content.goal}</p>
              </section>
            )}

            {content.controls && content.controls.length > 0 && (
              <section>
                <h4 className="font-semibold text-primary mb-2 text-lg">Cách chơi</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {content.controls.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {content.rules && content.rules.length > 0 && (
              <section>
                <h4 className="font-semibold text-primary mb-2 text-lg">Luật chơi</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {content.rules.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {content.tips && content.tips.length > 0 && (
              <section className="bg-background/80 p-4 rounded-lg border border-primary/20 shadow-sm mt-4">
                <h4 className="font-semibold text-primary mb-2 text-lg flex items-center gap-2">
                  <span className="text-xl">💡</span> Mẹo nhỏ
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground italic">
                  {content.tips.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
