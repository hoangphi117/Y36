import { ChevronLeft, ChevronRight, HelpCircle, Play } from "lucide-react";
import { RoundButton } from "../ui/round-button";

interface GameControlPanelProps {
  onNext: () => void;
  onPrev: () => void;
  onEnter: () => void;
  onHelp: () => void;
  // onBack: () => void; // Removed
  canEnter: boolean;
  isPlaying: boolean;
  gameLocked: boolean;
}

export const GameControlPanel = ({
  onNext,
  onPrev,
  onEnter,
  onHelp,
  // onBack removed
  canEnter,
  isPlaying,
  gameLocked,
}: GameControlPanelProps) => {
  return (
    <div className="flex flex-col items-center gap-6 mt-4 w-full max-w-md mx-auto">
      {/* ROW 1: NAVIGATION */}
      {!isPlaying && (
        <div className="flex items-center justify-center gap-2 mt-4 w-full">
          <RoundButton
            variant="neutral"
            size="medium"
            onClick={onPrev}
            className="w-16 h-16 !p-0 rounded-xl"
            sound="button1"
          >
            <ChevronLeft className="w-8 h-8" />
          </RoundButton>

          <RoundButton
            variant="neutral"
            size="medium"
            onClick={onNext}
            className="w-16 h-16 !p-0 rounded-xl"
            sound="button1"
          >
            <ChevronRight className="w-8 h-8" />
          </RoundButton>
        </div>
      )}

      {/* ROW 2: ENTER & HELP */}
      <div className="flex items-center justify-center gap-3 w-3/4">
        {/* ENTER button */}
        {!isPlaying && (
          <RoundButton
            variant={gameLocked ? "neutral" : "primary"}
            size="medium"
            onClick={onEnter}
            disabled={!canEnter || gameLocked}
            className="flex-[4] gap-3"
            sound={false}
          >
            <Play className="w-6 h-6 fill-current" />
            {gameLocked ? "BẢO TRÌ" : "CHƠI NGAY"}
          </RoundButton>
        )}

        {/* HELP button */}
        {!isPlaying && (
          <RoundButton
            variant="accent"
            size="medium"
            onClick={onHelp}
            className="flex-1 min-w-[60px] flex items-center justify-center p-0"
            title="HELP"
          >
            <HelpCircle className="w-6 h-6" />
          </RoundButton>
        )}
      </div>
    </div>

  );
};
