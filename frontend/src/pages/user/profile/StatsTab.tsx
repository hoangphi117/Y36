import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, AlertCircle } from "lucide-react";
import { GAMES_META } from "@/config/gameMeta";
import { useGameStats } from "@/hooks/useGameStats";

export function StatsTab() {
  const { stats, loading } = useGameStats();

  console.log(stats);

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const meta = GAMES_META.find((g) => g.id === stat.gameId);
        if (!meta) return null;
        const Icon = meta.icon;

        return (
          <Card key={stat.gameId} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{meta.name}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.rank ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {stat.score.toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">
                      {meta.type === "rank_points" ? "Elo" : "Điểm"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    Hạng:{" "}
                    <span className="font-bold text-primary">#{stat.rank}</span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-2xl font-bold text-muted-foreground">
                    --
                  </span>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Chưa chơi
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
