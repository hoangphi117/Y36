import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Trophy,
  LogIn,
  Leaf,
  LogOut,
  Users,
  MessageSquare,
  Menu,
  X,
  Settings,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { RoundButton } from "@/components/ui/round-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUser";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

export const Header = () => {
  const { user: localUser, token, logout, setAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const { data: serverUser } = useUserProfile();
  const updateProfile = useUpdateProfile();

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

  // Toggle theme and persist to backend if logged in
  const handleToggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // If user is logged in, save preference to backend
    if (user && token) {
      updateProfile.mutate({ 
        username: user.username,
        dark_mode: newTheme === "dark" 
      });
    }
  };

  const displayName = user?.username || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const NAV_ITEMS = [
  { to: "/", label: "Trang chủ", icon: Home, color: "hover:text-blue-500", bgColor: "hover:bg-blue-500/10", decoration: "bg-blue-500" },
  { to: "/ranking", label: "Xếp hạng", icon: Trophy, color: "hover:text-yellow-500", bgColor: "hover:bg-yellow-500/10", decoration: "bg-yellow-500" },
  { to: "/messages", label: "Tin nhắn", icon: MessageSquare, color: "hover:text-purple-500", bgColor: "hover:bg-purple-500/10", decoration: "bg-purple-500" },
  { to: "/profile?tab=friends", label: "Bạn bè", icon: Users, color: "hover:text-pink-500", bgColor: "hover:bg-pink-500/10", decoration: "bg-pink-500" },
];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="text-white w-5 h-5 fill-white/20" />
          </div>
          <span className="text-xl font-black text-primary tracking-tighter">Y36</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-primary" />
          ) : (
            <Menu className="w-6 h-6 text-primary" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden md:flex sticky top-0 h-screen flex-col border-r border-border bg-card pt-3 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20 px-2" : "w-46 px-1"
        )}
      >
        {/* LOGO */}
        <Link 
          to="/" 
          className={cn(
             "flex items-center gap-3 mb-10 group",
             isCollapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <div className="relative w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:-translate-y-1 shrink-0">
            <img src={logo} alt="Logo" className="w-10 h-10" />
            <div className="absolute inset-0 bg-green-900/20 rounded-2xl -z-10 translate-y-1" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-2xl font-black text-primary leading-none tracking-tighter truncate">
                Y36
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-1 truncate">
                Games Studio
              </span>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "relative flex items-center gap-4 py-3 rounded-xl font-bold text-muted-foreground transition-all duration-200 group overflow-hidden",
                item.color,
                item.bgColor,
                isCollapsed ? "justify-center px-0" : "px-4"
              )}
            >
              {/* Vệt màu trang trí bên cạnh (Chỉ xuất hiện khi hover hoặc active) */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-200",
                item.decoration
              )} />

              <item.icon className={cn(
                "w-6 h-6 shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-95",
                // Giữ màu icon nguyên bản hoặc đổi theo text hover
              )} />
              
              {!isCollapsed && (
                <span className="text-[15px] tracking-tight">{item.label}</span>
              )}
              
              {/* Hiệu ứng bóng sáng chạy qua khi hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </Link>
          ))}
        </nav>

        {/* User / Bottom Section */}
        <div className={cn(
          "border-t border-border flex items-center",
           isCollapsed ? "flex-col justify-center" : "flex-row"
        )}>
          {user ? (
            <>
              {/* PROFILE LINK (Left) */}
              <Link
                to="/profile"
                className={cn(
                  "flex items-center rounded-xl hover:bg-muted transition-colors cursor-pointer overflow-hidden outline-none",
                  isCollapsed ? "p-0 justify-center w-10 h-10" : "flex-1 gap-3 p-2 min-w-0"
                )}
                title={displayName}
              >
                <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                  <AvatarImage
                    src={user?.avatar_url ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
                
                {!isCollapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-bold truncate w-full">
                      {displayName}
                    </span>
                  </div>
                )}
              </Link>
              
              {/* SETTINGS DROPDOWN (Right) */}
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                   <div 
                     className={cn(
                        "rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex items-center justify-center",
                        isCollapsed ? "w-10 h-10 p-2" : "p-2"
                     )}
                     title="Cài đặt"
                   >
                     <Settings className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-6 h-6")} />
                   </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-60 bg-card rounded-xl p-2 ml-2 shadow-xl"
                >
                  <DropdownMenuLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider px-2">
                    Cài đặt
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate("/profile")}>
                     <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                       <User className="w-4 h-4" />
                       <span>Hồ sơ người dùng</span>
                     </div>
                   </div>

                  {/* Dark Mode Toggle */}
                   <div 
                     className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       handleToggleTheme();
                     }}
                   >
                     <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                       {resolvedTheme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                       <span>Giao diện tối</span>
                     </div>
                     <Switch 
                        checked={resolvedTheme === "dark"}
                        className="pointer-events-none"
                     />
                   </div>
                   
                   {/* Collapse Toggle */}
                   <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                     <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                       {isCollapsed ? <Menu className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                       <span>{isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}</span>
                     </div>
                     {/* Switch-like visual or just click the row */}
                   </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive font-bold focus:bg-destructive/10 focus:text-destructive rounded-lg py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth/login" className="w-full">
               {isCollapsed ? (
                  <div className="flex justify-center" title="Đăng nhập">
                     <RoundButton size="medium" variant="primary" className="!p-2 w-10 h-10">
                        <LogIn className="w-5 h-5" />
                     </RoundButton>
                  </div>
               ) : (
                  <RoundButton
                    size="medium"
                    variant="primary"
                    className="w-full flex items-center justify-center"
                  >
                    <LogIn className="w-5 h-5 shrink-0" />
                    <span className="text-sm">Đăng nhập</span>
                  </RoundButton>
               )}
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-[280px] h-full bg-background border-r p-6 animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to="/" className="flex items-center gap-3 mb-10" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter">Y36</span>
            </Link>

            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <Home className="w-6 h-6" />
                <span>Trang chủ</span>
              </Link>
              {/* ... Other mobile links ... */}
              <Link
                to="/ranking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <Trophy className="w-6 h-6" />
                <span>Xếp hạng</span>
              </Link>
              <Link
                to="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <MessageSquare className="w-6 h-6" />
                <span>Tin nhắn</span>
              </Link>
              <Link
                to="/profile?tab=friends"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <Users className="w-6 h-6" />
                <span>Bạn bè</span>
              </Link>
            </nav>

            <div className="absolute bottom-6 left-6 right-6 pt-6 border-t space-y-4">
               {user ? (
                 <>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar_url ?? undefined} />
                          <AvatarFallback>{firstLetter}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold truncate">{displayName}</span>
                      </div>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Settings className="w-5 h-5 text-muted-foreground" />
                      </Link>
                   </div>
                   
                   {/* Mobile Dark Mode Toggle */}
                   <div 
                     className="flex items-center justify-between px-1 py-2 cursor-pointer"
                     onClick={() => handleToggleTheme()}
                   >
                      <span className="text-sm font-medium text-muted-foreground">Giao diện tối</span>
                      <Switch 
                        checked={resolvedTheme === "dark"}
                        className="pointer-events-none"
                      />
                   </div>

                   <RoundButton
                     variant="danger"
                     size="medium"
                     className="w-full"
                     onClick={handleLogout}
                   >
                     <LogOut className="mr-2 w-4 h-4" />
                     <span>Đăng xuất</span>
                   </RoundButton>
                 </>
               ) : (
                 <RoundButton
                   variant="primary"
                   size="medium"
                   className="w-full"
                   onClick={() => navigate("/auth/login")}
                 >
                   <LogIn className="mr-2 w-4 h-4" />
                   <span>Đăng nhập</span>
                 </RoundButton>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
