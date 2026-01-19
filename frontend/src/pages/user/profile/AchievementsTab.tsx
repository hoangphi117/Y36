import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal, Lock, Award } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Danh sách tất cả thành tựu (Copy từ Backend hoặc tạo file shared constants)
// Ở đây hiển thị demo
const ALL_ACHIEVEMENTS_META = [
  {
    code: "FIRST_BLOOD",
    name: "Khởi đầu nan",
    desc: "Chơi ván đầu tiên",
    icon: Medal,
  },
  {
    code: "WINNER_1",
    name: "Chiến thắng đầu tay",
    desc: "Thắng 1 ván",
    icon: Award,
  },
  {
    code: "SNAKE_HUNTER",
    name: "Thợ săn rắn",
    desc: "1000 điểm Snake",
    icon: Award,
  },
  // ... thêm các meta khác để hiển thị cả những cái chưa đạt (dạng ẩn)
];

export function AchievementsTab() {
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/achievements").then((res) => {
      setUnlocked(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chỉ hiển thị những cái đã đạt được, hoặc hiển thị hết nhưng gray out cái chưa đạt */}
      {unlocked.length === 0 && !loading && (
        <div className="col-span-2 text-center text-muted-foreground py-10">
          Chưa có thành tựu nào. Hãy chơi game ngay!
        </div>
      )}

      {unlocked.map((ach) => (
        <Card
          key={ach.id}
          className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
        >
          <CardHeader className="pb-2 flex flex-row items-center gap-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-base">{ach.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{ach.description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-background">
                {ach.code}
              </Badge>
              <span>
                {format(new Date(ach.unlocked_at), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
