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
    primary: "bg-primary border-green-700 hover:bg-green-600 text-white",
    accent:
      "bg-yellow-400 border-yellow-600 hover:bg-yellow-500 text-yellow-900",
    danger: "bg-red-500 border-red-700 hover:bg-red-600 text-white",
    neutral: "bg-gray-200 border-gray-400 hover:bg-gray-300 text-gray-700",
  };

  const sizeStyles = {
    small:
      "h-10 px-4 text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px]",

    medium:
      "h-14 px-6 text-md border-b-[6px] active:border-b-0 active:translate-y-[6px]",

    large:
      "h-20 px-12 text-2xl border-b-[8px] active:border-b-0 active:translate-y-[8px]",

    mobile:
      "h-14 w-full text-xl border-b-[6px] active:border-b-0 active:translate-y-[6px]",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-2xl font-black uppercase tracking-widest",
        "transition-all duration-100 ease-in-out",
        "select-none cursor-pointer active:shadow-inner",
        "shadow-md",

        sizeStyles[size],

        variants[variant],

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
