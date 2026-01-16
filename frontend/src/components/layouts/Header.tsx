import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Trophy,
  LogIn,
  Leaf,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserProfile } from "@/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
export const Header = () => {
  const { user: localUser, token, logout, setAuth } = useAuthStore();

  const { data: serverUser } = useUserProfile();

  const navigate = useNavigate();

  const user = serverUser || localUser;

  useEffect(() => {
    if (serverUser && token) {
      if (JSON.stringify(serverUser) !== JSON.stringify(localUser)) {
        setAuth(serverUser, token);
      }
    }
  }, [serverUser, token, localUser, setAuth]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const displayName = user?.username || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

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

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border border-transparent hover:bg-muted transition-colors cursor-pointer">
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold">
                      Xin chào, {displayName}
                    </span>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={user?.avatar_url ?? undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {firstLetter}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Tài khoản
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer font-medium rounded-lg focus:bg-primary/10 focus:text-primary">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <Link to="/profile">Hồ sơ của tôi</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer font-medium rounded-lg focus:bg-primary/10 focus:text-primary">
                  <Users className="mr-2 h-4 w-4" />
                  <Link to="/profile?tab=friends">Bạn bè</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive font-medium focus:bg-destructive/10 focus:text-destructive rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth/login">
              <RoundButton
                size="medium"
                variant="primary"
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Đăng nhập</span>
              </RoundButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
