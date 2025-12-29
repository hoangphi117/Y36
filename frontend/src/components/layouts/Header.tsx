import { ModeToggle } from "@/features/ThemeButton";
import { Link } from "react-router-dom";
import { RoundButton } from "../ui/round-button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto w-[90%] md:w-[80%] h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-14 h-14 group">
            <div
              className="absolute inset-0 rounded-2xl
               bg-emerald-300
               -rotate-6
               transition-transform duration-300
               group-hover:-rotate-3"
            />

            <div
              className="absolute inset-0 rounded-xl
               bg-primary
               rotate-6
               transition-transform duration-300
               group-hover:rotate-3"
            />
            <div
              className="relative z-10 w-14 h-14 rounded-2xl
               flex items-center justify-center
               text-white font-extrabold text-2xl
               shadow-lg
               transition-transform duration-300
               group-hover:rotate-0"
            >
              <span className="text-3xl [-webkit-text-stroke:1px_#134E4A]">
                Y
              </span>
              <span className="text-xl">36</span>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/games" className="hover:text-primary transition-colors">
            Trò chơi
          </Link>
          <Link to="/rank" className="hover:text-primary transition-colors">
            Xếp hạng
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link to="/">
            <RoundButton size="medium" variant="primary">
              Đăng nhập
            </RoundButton>
          </Link>
        </div>
      </div>
    </header>
  );
};
