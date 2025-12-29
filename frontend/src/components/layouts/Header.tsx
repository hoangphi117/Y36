import { ModeToggle } from "@/features/ThemeButton";
import { Link } from "react-router-dom";
import { Home, Trophy, LogIn, Leaf } from "lucide-react";
import { RoundButton } from "../ui/round-button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-[90%] md:w-[80%] h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-translate-y-1">
            <Leaf className="text-white w-7 h-7 fill-white/20" />
            <div className="absolute inset-0 bg-green-900/20 rounded-2xl -z-10 translate-y-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary leading-none tracking-tighter">
              Y36
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-1">
              Games Studio
            </span>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-muted-foreground hover:text-primary transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Trang chủ</span>
          </Link>
          <Link
            to="/rank"
            className="flex items-center gap-2 font-bold text-muted-foreground group hover:text-primary transition-all"
          >
            <Trophy className="w-5 h-5 group-hover:text-yellow-500 transition-all" />
            <span>Xếp hạng</span>
          </Link>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link to="/login">
            <RoundButton
              size="medium"
              variant="primary"
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Đăng nhập</span>
            </RoundButton>
          </Link>
        </div>
      </div>
    </header>
  );
};
