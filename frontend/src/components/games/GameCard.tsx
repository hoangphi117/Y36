import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";
import { Play } from "lucide-react";

interface GameCardProps {
  title: string;
  image: string;
  variant?: "primary" | "accent" | "danger";
  onClick?: () => void;
  className?: string;
}

export const GameCard = ({
  title,
  image,
  variant = "primary",
  onClick,
  className,
}: GameCardProps) => {
  const shadowColors = {
    primary: "shadow-[-8px_8px_0_#15803d]", // Green-700
    accent: "shadow-[-8px_8px_0_#b45309]", // Amber-700
    danger: "shadow-[-8px_8px_0_#b91c1c]", // Red-700
  };

  return (
    <div
      className={cn(
        "relative group flex flex-col bg-card rounded-[2.5rem] border-2 border-border",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:translate-x-2",
        shadowColors[variant],
        className
      )}
    >
      <div className="p-5">
        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-muted border-2 border-border/40">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-current pointer-events-none" />
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col items-center">
        <h3 className="text-xl font-black text-foreground tracking-tight mb-4 uppercase italic text-center line-clamp-1">
          {title}
        </h3>

        <RoundButton
          variant={variant}
          size="medium"
          className="w-full gap-2 shadow-sm"
          onClick={onClick}
        >
          <Play className="w-5 h-5 fill-current shrink-0" />
          <span>Chơi Ngay</span>
        </RoundButton>
      </div>
    </div>
  );
};
