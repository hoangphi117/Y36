import React from "react";
import { cn } from "@/lib/utils";

interface RoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "danger" | "neutral";
  size?: "small" | "medium" | "large" | "mobile";
}

export const RoundButton = ({
  className,
  variant = "primary",
  size = "medium",
  children,
  ...props
}: RoundButtonProps) => {
  const variants = {
    primary:
      "bg-primary text-primary-foreground border-black/30 hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.2)]",

    accent:
      "bg-accent text-accent-foreground border-black/30 hover:bg-accent/90 shadow-[0_0_15px_rgba(var(--accent),0.2)]",

    danger:
      "bg-destructive text-destructive-foreground border-black/30 hover:bg-destructive/90",

    neutral: "bg-muted text-muted-foreground border-black/20 hover:bg-muted/80",
  };

  const sizeStyles = {
    small:
      "h-10 px-4 text-sm border-b-[5px] active:border-b-[3px] active:translate-y-[2px]",

    medium:
      "h-14 px-6 text-md border-b-[8px] active:border-b-[3px] active:translate-y-[3px]",

    large:
      "h-20 px-12 text-2xl border-b-[9px] active:border-b-[4px] active:translate-y-[4px]",

    mobile:
      "h-14 w-full text-xl border-b-[6px] active:border-b-[2px] active:translate-y-[6px]",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-2xl font-black uppercase tracking-widest",
        "transition-all duration-75 ease-out",
        "select-none cursor-pointer active:shadow-inner",
        "border-x-2 border-t-2 border-white/10",

        sizeStyles[size],
        variants[variant],

        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
