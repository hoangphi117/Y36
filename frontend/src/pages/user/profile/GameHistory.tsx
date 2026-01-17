import { useGameHistory } from "@/hooks/useGameHistory";
import { GAME_ID_MAP } from "@/types/game";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Loader2,
  Trash2,
  Calendar,
  Trophy,
  Clock,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export function GameHistory() {
  const { data, isLoading, isError, setPage, deleteSession } = useGameHistory(
    1,
    10,
    {
      status: "completed",
    }
  );

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 p-8">Lỗi tải lịch sử đấu.</div>
    );

  if (data?.data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
        <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>Không có ván đấu nào đã hoàn thành.</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}p ${sec}s`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {data?.data.map((session) => (
          <Card
            key={session.id}
            className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500"
          >
            {/* Thông tin Game */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 dark:bg-green-950/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">
                  {GAME_ID_MAP[session.game_id] || `Game #${session.game_id}`}
                </h4>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(session.started_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.play_time_seconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Điểm số & Hành động */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end font-bold text-green-600 dark:text-green-400 text-lg">
                  <Trophy className="w-5 h-5" /> {session.score} điểm
                </div>
                <Badge
                  variant="outline"
                  className="mt-1 bg-green-50 text-green-700 border-green-200"
                >
                  Đã hoàn thành
                </Badge>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa lịch sử?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dữ liệu ván đấu "{GAME_ID_MAP[session.game_id]}" này sẽ bị
                      xóa vĩnh viễn khỏi hệ thống.
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
        ))}
      </div>

      {/* Phân trang dựa trên dữ liệu gốc từ API */}
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
