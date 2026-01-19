import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/lib/axios";
import { GAMES_META } from "@/config/gameMeta";

export interface GameStat {
  gameId: number;
  rank: number | null;
  score: number;
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const promises = GAMES_META.map((game) =>
        axiosClient
          .get(`/rankings/me`, { params: { gameId: game.id } })
          .then((res) => ({
            gameId: game.id,
            rank: res.data.data?.rank || null,
            score: res.data.data?.score || 0,
          }))
          .catch(() => ({
            gameId: game.id,
            rank: null,
            score: 0,
          })),
      );

      const results = await Promise.all(promises);
      setStats(results);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
