import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  image: string;
  variant?: "primary" | "accent" | "danger";
  className?: string;
}

export const GameCard = ({
  title,
  image,
  variant = "primary",
  className,
}: GameCardProps) => {
  const borderColor = {
    primary: "border-primary",
    accent: "border-accent",
    danger: "border-destructive",
  }[variant];

  return (
    <div
      className={cn(
        "relative group",
        "w-full max-w-[320px] mx-auto",
        className
      )}
    >
      {/* LAYER 1: Khối nền bên dưới - Đã chuyển sang bên TRÁI (-translate-x-3) */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl -translate-x-3 translate-y-2",
          {
            "bg-primary/40": variant === "primary",
            "bg-accent/40": variant === "accent",
            "bg-destructive/40": variant === "danger",
          }
        )}
      />

      {/* LAYER 2: Mặt Card chính */}
      <div
        className={cn(
          "relative flex flex-col h-full",
          "bg-card rounded-2xl border-[3px]", 
          borderColor,
          "transition-all duration-200 ease-out",
          
          /* Đổ bóng (độ dày) sang bên TRÁI (-8px) */
          variant === "primary" && "shadow-[-7px_4px_0px_0px_var(--primary)]",
          variant === "accent" && "shadow-[-8px_3px_0px_0px_var(--accent)]",
          variant === "danger" && "shadow-[-8px_3px_0px_0px_var(--destructive)]",

          /* TRẠNG THÁI HOVER: 
             Dịch chuyển sang TRÁI (-4px) và xuống DƯỚI (4px) để đè lên phần bóng 
          */
          "group-hover:-translate-x-[4px] group-hover:translate-y-[4px]",
          
          /* Giảm độ dày bóng khi hover */
          variant === "primary" && "group-hover:shadow-[-4px_2px_0px_0px_var(--primary)]",
          variant === "accent" && "group-hover:shadow-[-4px_2px_0px_0px_var(--accent)]",
          variant === "danger" && "group-hover:shadow-[-4px_2px_0px_0px_var(--destructive)]",
        )}
      >
        {/* Nội dung Card */}
        <div className="p-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-foreground/10 bg-muted">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />
          </div>
        </div>

        <div className="px-4 pb-6 flex flex-col items-center">
          <div className={cn(
            "px-3 py-0.5 rounded-md border-2 text-[10px] font-black uppercase tracking-tighter mb-3",
            borderColor,
            "bg-background"
          )}>
            GAME
          </div>
          <h3 className="text-xl font-black text-foreground text-center uppercase italic leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};