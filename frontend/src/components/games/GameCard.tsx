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
        className
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
