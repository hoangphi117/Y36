import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Users, Crown, Trophy, User } from "lucide-react";
import { GAMES_META } from "@/config/gameMeta";
import { cn } from "@/lib/utils";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useRanking } from "@/hooks/useRanking";
import { PaginationCustom } from "@/components/shared/PaginationCustom";
import { type RankingUser } from "@/types/rankingUser";

type PodiumStyle = {
  height: string;
  color: string;
  avatarBorder: string;
  crown: boolean;
};

const PODIUM_STYLE_MAP: Record<1 | 2 | 3, PodiumStyle> = {
  1: {
    height: "h-48 md:h-56",
    color:
      "bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-500",
    avatarBorder: "border-yellow-400",
    crown: true,
  },
  2: {
    height: "h-36 md:h-44",
    color:
      "bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-800/50 dark:border-slate-500 dark:text-slate-400",
    avatarBorder: "border-slate-400",
    crown: false,
  },
  3: {
    height: "h-28 md:h-36",
    color:
      "bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/20 dark:border-orange-600 dark:text-orange-500",
    avatarBorder: "border-orange-400",
    crown: false,
  },
};

export default function RankingPage() {
  useDocumentTitle("Bảng Xếp Hạng");

  const [activeGame, setActiveGame] = useState(1);
  const [scope, setScope] = useState<"global" | "friends" | "mine">("global");
  const [page, setPage] = useState(1);
  
  const { data, myRank: myRankData, rankingType, loading, pagination } = useRanking(
    activeGame,
    scope,
    page,
    10,
  );
  
  // Use generic loading state for both lists and single rank fetching
  const loadingMyRank = scope === "mine" && loading;

  const handleGameChange = (id: number) => {
    setActiveGame(id);
    setPage(1);
  };

  const handleScopeChange = (newScope: "global" | "friends" | "mine") => {
    setScope(newScope);
    setPage(1);
  };

  const getScore = (user?: RankingUser) => {
    if (!user) return 0;
    return rankingType === "rank_points"
      ? (user.rank_points ?? 0)
      : (user.high_score ?? 0);
  };

  const isFirstPage = page === 1;
  const top3 = isFirstPage ? data.slice(0, 3) : [];
  const listData = isFirstPage ? data.slice(3) : data;

  const startRankIndex = isFirstPage ? 4 : (page - 1) * 10 + 1;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      {/* --- HEADER --- */}
      <div className="text-center mb-8 space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-primary uppercase drop-shadow-sm tracking-tight">
          Bảng Xếp Hạng
        </h1>

        {/* Nút chuyển Scope (Global / Friends) */}
        <div className="flex justify-center">
          <div className="bg-muted p-1 rounded-full flex gap-1 shadow-inner">
            <button
              onClick={() => handleScopeChange("global")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                scope === "global"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <Globe className="w-4 h-4" /> Hệ thống
            </button>
            <button
              onClick={() => handleScopeChange("friends")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                scope === "friends"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <Users className="w-4 h-4" /> Bạn bè
            </button>
            <button
              onClick={() => handleScopeChange("mine")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                scope === "mine"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <User className="w-4 h-4" /> Của tôi
            </button>
          </div>
        </div>
      </div>

      {/* --- GAME SELECTOR (Danh sách game ngang) --- */}
      <div className="w-full max-w-4xl mb-8 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex md:justify-center gap-3 min-w-max px-2">
          {GAMES_META.map((game) => {
            const Icon = game.icon;
            const isActive = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => handleGameChange(game.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[100px] group",
                  isActive
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-transparent bg-card hover:bg-accent/50 hover:border-border",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-transform group-hover:scale-110 text-muted-foreground",
                  )}
                />
                <span className="text-xs font-bold">{game.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="w-full max-w-3xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : scope !== "mine" && data.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              Chưa có dữ liệu xếp hạng
            </p>
          </div>
        ) : (
          <>
            {/* 1. PODIUM (Bục vinh quang - Chỉ hiện ở Trang 1 và khi có dữ liệu) */}
            {isFirstPage && data.length > 0 && (
              <div className="grid grid-cols-3 gap-2 md:gap-8 items-end mb-10 mt-4 min-h-[240px]">
                {/* Hạng 2 (Trái) */}
                <PodiumItem
                  user={top3[1]}
                  rank={2}
                  score={getScore(top3[1])}
                  type={rankingType}
                />
                {/* Hạng 1 (Giữa - Cao nhất) */}
                <PodiumItem
                  user={top3[0]}
                  rank={1}
                  score={getScore(top3[0])}
                  type={rankingType}
                />
                {/* Hạng 3 (Phải) */}
                <PodiumItem
                  user={top3[2]}
                  rank={3}
                  score={getScore(top3[2])}
                  type={rankingType}
                />
              </div>
            )}

            {/* 2. RANKING LIST */}
            <div className="space-y-3">
              {listData.map((user, idx) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-4 p-3 sm:p-4 bg-card rounded-xl border shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground text-lg group-hover:text-primary transition-colors">
                    #{startRankIndex + idx}
                  </div>

                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-transparent group-hover:border-primary transition-all">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="font-bold">
                      {user.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate text-base">
                      {user.username}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>🏆 {user.total_wins ?? 0} Thắng</span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <span>🎮 {user.total_matches ?? 0} Trận</span>
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-sm sm:text-base px-3 py-1 bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    {getScore(user).toLocaleString()}{" "}
                    <span className="text-[10px] ml-1 uppercase opacity-80 font-normal">
                      {rankingType === "rank_points" ? "Elo" : "Pts"}
                    </span>
                  </Badge>
                </div>
              ))}
            </div>

            {/* 3. PAGINATION CONTROL */}
            {scope !== "mine" && (
              <div className="py-6">
                <PaginationCustom
                  page={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
        
        {/* MY RANK CONTENT */}
        {scope === "mine" && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
             {loadingMyRank ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Đang tải thứ hạng...</p>
                </div>
             ) : !myRankData ? (
                <div className="text-center p-8 bg-muted/30 rounded-2xl border border-dashed">
                  <p className="text-muted-foreground">Bạn chưa có xếp hạng trong game này.</p>
                  <p className="text-sm text-muted-foreground mt-2">Hãy chơi vài ván để được xếp hạng nhé!</p>
                </div>
             ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                   <div className="relative mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/20 shadow-xl">
                         <span className="text-5xl font-black text-primary">#{myRankData.rank}</span>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                        Thứ hạng của bạn
                      </div>
                   </div>
                   
                   <div className="mt-4 text-center">
                     <div className="text-6xl font-black tracking-tighter mb-2">
                       {myRankData.score?.toLocaleString()}
                     </div>
                     <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                       {rankingType === "rank_points" ? "Điểm Elo" : "Điểm Cao Nhất"}
                     </span>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

const PodiumItem = ({
  user,
  rank,
  score,
  type,
}: {
  user?: RankingUser;
  rank: number;
  score?: number;
  type: string;
}) => {
  if (!user) return <div className="flex-1 w-full" />;

  const isRank1 = rank === 1;

  const styleConfig =
    PODIUM_STYLE_MAP[rank as 1 | 2 | 3] ?? PODIUM_STYLE_MAP[3];

  return (
    <div
      className={`flex flex-col items-center z-10 ${isRank1 ? "-mt-4" : ""}`}
    >
      {/* Avatar Section */}
      <div className="relative mb-3 group">
        {styleConfig.crown && (
          <Crown className="w-8 h-8 text-yellow-500 absolute -top-9 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-sm" />
        )}
        <Avatar
          className={cn(
            "w-14 h-14 md:w-20 md:h-20 border-4 shadow-lg transition-transform group-hover:scale-105",
            styleConfig.avatarBorder,
          )}
        >
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="font-bold text-lg">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md border border-background">
          #{rank}
        </div>
      </div>

      {/* Podium Block */}
      <div
        className={cn(
          "w-full rounded-t-xl flex flex-col items-center justify-start pt-4 border-t-4 shadow-inner px-1",
          styleConfig.color,
          styleConfig.height,
        )}
      >
        <span className="font-bold text-xs md:text-sm truncate max-w-[90%] text-center block mb-1">
          {user.username}
        </span>
        <span className="font-black text-lg md:text-2xl tracking-tighter">
          {score?.toLocaleString()}
        </span>
        <span className="text-[10px] md:text-xs font-medium uppercase opacity-80">
          {type === "rank_points" ? "Elo" : "Điểm"}
        </span>
      </div>
    </div>
  );
};
