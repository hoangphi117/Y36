import React from "react";
import { cn } from "@/lib/utils";

interface BoxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "danger" | "neutral";
  size?: "small" | "medium" | "large" | "mobile";
}

export const BoxButton = ({
  className,
  variant = "primary",
  size = "medium",
  children,
  ...props
}: BoxButtonProps) => {
  const variants = {
    primary: {
      face: "bg-green-500 text-white",
      side: "before:bg-green-700 after:bg-green-800",
    },
    accent: {
      face: "bg-yellow-400 text-yellow-900",
      side: "before:bg-yellow-600 after:bg-yellow-700",
    },
    danger: {
      face: "bg-red-500 text-white",
      side: "before:bg-red-700 after:bg-red-800",
    },
    neutral: {
      face: "bg-gray-200 text-gray-700",
      side: "before:bg-gray-400 after:bg-gray-500",
    },
  };

  const sizeStyles = {
    small: {
      base: "h-10 px-4 text-sm font-bold",
      // Dày 6px
      depth: [
        "before:w-[6px] before:left-[-6px] before:top-[3px]",
        "after:h-[6px] after:bottom-[-6px] after:left-[-3px]",
      ],
      // Nhấn xuống
      active: [
        "active:translate-y-[3px] active:translate-x-[-3px]",
        "active:before:w-[3px] active:before:left-[-3px] active:before:top-[1.5px]",
        "active:after:h-[3px] active:after:bottom-[-3px] active:after:left-[-1.5px]",
      ],
    },
    medium: {
      base: "h-14 px-8 text-lg font-black tracking-wider",
      // Dày 10px
      depth: [
        "before:w-[10px] before:left-[-10px] before:top-[5px]",
        "after:h-[10px] after:bottom-[-10px] after:left-[-5px]",
      ],
      // Nhấn xuống
      active: [
        "active:translate-y-[6px] active:translate-x-[-6px]",
        "active:before:w-[4px] active:before:left-[-4px] active:before:top-[2px]",
        "active:after:h-[4px] active:after:bottom-[-4px] active:after:left-[-2px]",
      ],
    },
    large: {
      base: "h-20 px-12 text-2xl font-black tracking-widest",
      // Dày 16px
      depth: [
        "before:w-[16px] before:left-[-16px] before:top-[8px]",
        "after:h-[16px] after:bottom-[-16px] after:left-[-8px]",
      ],
      // Nhấn xuống
      active: [
        "active:translate-y-[10px] active:translate-x-[-10px]",
        "active:before:w-[6px] active:before:left-[-6px] active:before:top-[3px]",
        "active:after:h-[6px] active:after:bottom-[-6px] active:after:left-[-3px]",
      ],
    },
    mobile: {
      base: "h-14 w-full text-xl font-bold uppercase",
      // Dày 8px
      depth: [
        "before:w-[8px] before:left-[-8px] before:top-[4px]",
        "after:h-[8px] after:bottom-[-8px] after:left-[-4px]",
      ],
      // Nhấn xuống
      active: [
        "active:translate-y-[4px] active:translate-x-[-4px]",
        "active:before:w-[4px] active:before:left-[-4px] active:before:top-[2px]",
        "active:after:h-[4px] active:after:bottom-[-4px] active:after:left-[-2px]",
      ],
    },
  };

  const colors = variants[variant];
  const sizes = sizeStyles[size];

  return (
    <button
      className={cn(
        "relative flex items-center justify-center ",
        "transition-all duration-100 ease-out",
        "select-none cursor-pointer",

        sizes.base,

        colors.face,

        "before:content-[''] before:absolute",
        "before:h-full before:skew-y-[-45deg]",
        "before:transition-all before:duration-100",
        sizes.depth[0],

        "after:content-[''] after:absolute",
        "after:w-full after:skew-x-[-45deg]",
        "after:transition-all after:duration-100",
        sizes.depth[1],

        colors.side,

        sizes.active,

        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};
