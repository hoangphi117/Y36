import { useState } from "react";
import { useGameHistory } from "@/hooks/useGameHistory";
import { GAME_ID_MAP } from "@/types/game";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Loader2,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Minus,
  Gamepad2,
  XCircle,
  Worm,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { PaginationCustom } from "@/components/shared/PaginationCustom";
import { cn } from "@/lib/utils";

const COMPETITIVE_GAMES = [1, 2, 4];

export function GameHistory() {
  const [filterGameId, setFilterGameId] = useState<string>("all");

  const queryParams: any = { status: "completed" };
  if (filterGameId !== "all") {
    queryParams.gameId = Number(filterGameId);
  }

  const { data, isLoading, isError, setPage, deleteSession } = useGameHistory(
    1,
    10,
    queryParams,
  );

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}p ${sec}s`;
  };

  const getGameStatusUI = (gameId: number, score: number) => {
    const isCompetitive = COMPETITIVE_GAMES.includes(gameId);

    if (isCompetitive) {
      if (score > 0) {
        return {
          label: "THẮNG",
          subLabel: "+1 Elo",
          color: "text-yellow-600 dark:text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-l-yellow-500",
          icon: <Trophy className="w-6 h-6" />,
        };
      }
      if (score < 0) {
        return {
          label: "THUA",
          subLabel: "-1 Elo",
          color: "text-red-600 dark:text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-l-red-500",
          icon: <XCircle className="w-6 h-6" />,
        };
      }
      return {
        label: "HÒA",
        subLabel: "+0 Elo",
        color: "text-slate-600 dark:text-slate-400",
        bgColor: "bg-slate-50 dark:bg-slate-900/20",
        borderColor: "border-l-slate-400",
        icon: <Minus className="w-6 h-6" />,
      };
    }

    return {
      label: `${score.toLocaleString()}`,
      subLabel: "Điểm",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-l-blue-500",
      icon: <Worm className="w-6 h-6" />,
    };
  };

  return (
    <div className="space-y-4">
      {/* [MỚI] Thanh Filter */}
      <div className="flex justify-end mb-2">
        <Select
          value={filterGameId}
          onValueChange={(val) => {
            setFilterGameId(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Lọc theo game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trò chơi</SelectItem>
            {/* Tạo danh sách option từ GAME_ID_MAP */}
            {Object.entries(GAME_ID_MAP).map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 p-8">Lỗi tải lịch sử đấu.</div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>
            {filterGameId !== "all"
              ? `Chưa có lịch sử đấu cho game này.`
              : "Không có ván đấu nào đã hoàn thành."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.data.map((session) => {
            const ui = getGameStatusUI(session.game_id, session.score);

            return (
              <Card
                key={session.id}
                className={cn(
                  "p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all border-l-4",
                  ui.borderColor,
                )}
              >
                {/* Thông tin Game */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div
                    className={cn(
                      "p-3 rounded-xl flex-shrink-0 transition-colors",
                      ui.bgColor,
                      ui.color,
                    )}
                  >
                    {ui.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg truncate">
                        {GAME_ID_MAP[session.game_id] ||
                          `Game #${session.game_id}`}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(
                          new Date(session.started_at),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: vi,
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.play_time_seconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Điểm số & Hành động */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pl-14 md:pl-0">
                  <div className="text-right">
                    <div
                      className={cn(
                        "flex items-center gap-1 justify-end font-black text-xl",
                        ui.color,
                      )}
                    >
                      {ui.label}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-right">
                      {ui.subLabel}
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa lịch sử?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Dữ liệu ván đấu "{GAME_ID_MAP[session.game_id]}" này
                          sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSession(session.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Xóa ngay
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {data?.pagination && (
        <PaginationCustom
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
