import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Medal,
  Award,
  Grid3x3,
  Worm,
  SquareStack,
  Candy,
  Brain,
  Palette,
  LayoutGrid,
  Trophy,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { PaginationCustom } from "@/components/shared/PaginationCustom";

type GameTheme = {
  label: string;
  icon: any;

  cardClass: string;

  iconBoxClass: string;

  iconColorClass: string;
};

const GAME_THEMES: Record<number | string, GameTheme> = {
  1: {
    label: "Caro 5 hàng",
    icon: Grid3x3,
    cardClass: "border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10",
    iconBoxClass: "bg-purple-100 dark:bg-purple-800",
    iconColorClass: "text-purple-600 dark:text-purple-400",
  },
  2: {
    label: "Caro 4 hàng",
    icon: Grid3x3,
    cardClass: "border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10",
    iconBoxClass: "bg-purple-100 dark:bg-purple-800",
    iconColorClass: "text-purple-600 dark:text-purple-400",
  },

  4: {
    label: "Tic Tac Toe",
    icon: SquareStack,
    cardClass: "border-l-red-500 bg-red-50/50 dark:bg-red-200/10",
    iconBoxClass: "bg-red-100 dark:bg-red-400",
    iconColorClass: "text-red-600 dark:text-red-900",
  },

  3: {
    label: "Rắn Săn Mồi",
    icon: Worm,
    cardClass: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
    iconBoxClass: "bg-blue-100 dark:bg-blue-800",
    iconColorClass: "text-blue-600 dark:text-blue-400",
  },

  6: {
    label: "Cờ Trí Nhớ",
    icon: Brain,
    cardClass: "border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10",
    iconBoxClass: "bg-orange-100 dark:bg-orange-800",
    iconColorClass: "text-orange-600 dark:text-orange-400",
  },

  5: {
    label: "Ghép Hàng 3",
    icon: Candy,
    cardClass:
      "border-l-pink-500 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/10 dark:to-blue-900/10",
    iconBoxClass: "bg-pink-100 dark:bg-pink-800",
    iconColorClass: "text-pink-600 dark:text-pink-400",
  },

  7: {
    label: "Bảng Vẽ",
    icon: Palette,
    cardClass: "border-l-slate-500 bg-slate-50/50 dark:bg-slate-900/10",
    iconBoxClass: "bg-slate-100 dark:bg-slate-800",
    iconColorClass: "text-slate-600 dark:text-slate-400",
  },

  default: {
    label: "Hệ thống",
    icon: Medal,
    cardClass: "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10",
    iconBoxClass: "bg-yellow-100 dark:bg-yellow-800",
    iconColorClass: "text-yellow-600 dark:text-yellow-400",
  },
};

interface Achievement {
  id: number;
  user_id: string;
  game_id: number | null;
  code: string;
  name: string;
  description: string;
  unlocked_at: string;
}

const ITEMS_PER_PAGE = 6; // Số lượng thành tựu mỗi trang

export function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterGameId, setFilterGameId] = useState<string | number>("all");
  // [MỚI] State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/achievements")
      .then((res) => {
        setAchievements(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 1. Lọc dữ liệu
  const displayedAchievements = achievements.filter((ach) => {
    if (filterGameId === "all") return true;
    if (filterGameId === "system") return ach.game_id === null;
    return ach.game_id === Number(filterGameId);
  });

  // 2. [MỚI] Tính toán phân trang
  const totalPages = Math.ceil(displayedAchievements.length / ITEMS_PER_PAGE);
  const paginatedAchievements = displayedAchievements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // 3. [MỚI] Hàm xử lý khi đổi bộ lọc -> Reset về trang 1
  const handleFilterChange = (id: string | number) => {
    setFilterGameId(id);
    setCurrentPage(1);
  };

  const filterOptions = [
    { id: "all", label: "Tất cả", icon: LayoutGrid },
    { id: "system", label: "Hệ thống", icon: Medal },
    ...Object.entries(GAME_THEMES)
      .filter(([key]) => key !== "default")
      .map(([key, theme]) => ({
        id: Number(key),
        label: theme.label,
        icon: theme.icon,
      })),
  ];

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max px-1">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = filterGameId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleFilterChange(opt.id)} // [SỬA] Gọi hàm handle mới
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayedAchievements.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Chưa có thành tựu nào ở mục này.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* [SỬA] Render danh sách đã phân trang (paginatedAchievements) */}
            {paginatedAchievements.map((ach) => {
              const theme =
                ach.game_id && GAME_THEMES[ach.game_id]
                  ? GAME_THEMES[ach.game_id]
                  : GAME_THEMES["default"];

              const IconComponent = theme.icon;

              return (
                <Card
                  key={ach.id}
                  className={cn(
                    "border-l-4 transition-all hover:shadow-md",
                    theme.cardClass,
                  )}
                >
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-full shrink-0",
                        theme.iconBoxClass,
                      )}
                    >
                      <IconComponent
                        className={cn("w-6 h-6", theme.iconColorClass)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {ach.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ach.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1 border-t pt-2 border-black/5 dark:border-white/5">
                      <Badge variant="outline" className="bg-background/50">
                        {ach.code}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {format(new Date(ach.unlocked_at), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* [MỚI] Component Phân trang */}
          {totalPages > 1 && (
            <div className="pt-4">
              <PaginationCustom
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
