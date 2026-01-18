import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";
import { Play, Star } from "lucide-react";

interface GameCardProps {
  title: string;
  image: string;
  variant?: "primary" | "accent" | "danger";
  onClick?: () => void;
  className?: string;
  rating?: number;
}

export const GameCard = ({
  title,
  image,
  variant = "primary",
  onClick,
  className,
  rating,
}: GameCardProps) => {
  const shadowStyle = {
    primary: "shadow-[-8px_8px_0_var(--primary)]",
    accent: "shadow-[-8px_8px_0_var(--accent)]",
    danger: "shadow-[-8px_8px_0_var(--destructive)]",
  }[variant];

  return (
    <div
      className={cn(
        "relative group flex flex-col bg-card rounded-[2.5rem] border-2 border-border",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:translate-x-2",
        "hover:shadow-none",
        shadowStyle,
        className,
      )}
    >
      <div className="p-5">
        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-muted border-2 border-border/40 shadow-inner">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-primary pointer-events-none" />

          {/* [THÊM MỚI] Rating Badge */}
          {rating !== undefined && rating > 0 && (
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-yellow-400/50 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-foreground">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col items-center">
        <h3 className="text-xl font-black text-foreground tracking-tight mb-4 uppercase italic text-center line-clamp-1 drop-shadow-sm">
          {title}
        </h3>

        <RoundButton
          variant={variant}
          size="medium"
          className="w-full gap-2 shadow-sm active:shadow-none"
          onClick={onClick}
        >
          <Play className="w-5 h-5 fill-current shrink-0" />
          <span>Chơi Ngay</span>
        </RoundButton>
      </div>
    </div>
  );
};
