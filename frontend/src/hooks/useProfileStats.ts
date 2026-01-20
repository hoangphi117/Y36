import { useState, useEffect } from "react";
import axiosClient from "@/lib/axios";
import { useFriendsList } from "./useUser";
import { useGameStats } from "./useGameStats";
import { useGameHistory } from "./useGameHistory";

/**
 * Custom hook to fetch all statistics data for the Profile overview page
 */
export function useProfileStats() {
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Fetch friends data
  const { data: friendsData, isLoading: friendsLoading } = useFriendsList({
    page: 1,
    limit: 1,
  });

  // Fetch game stats
  const { stats, loading: statsLoading } = useGameStats();

  // Fetch game history
  const { data: historyData, isLoading: historyLoading } = useGameHistory(1, 1);

  // Fetch achievements count
  useEffect(() => {
    setAchievementsLoading(true);
    axiosClient
      .get("/achievements")
      .then((res) => {
        setAchievementsCount(res.data.data?.length || 0);
      })
      .catch(() => setAchievementsCount(0))
      .finally(() => setAchievementsLoading(false));
  }, []);

  // Calculate if any data is still loading
  const isLoading =
    achievementsLoading || friendsLoading || statsLoading || historyLoading;

  // Calculate best rank from stats
  const bestRank =
    statsLoading || stats.filter((s) => s.rank).length === 0
      ? null
      : Math.min(...stats.filter((s) => s.rank).map((s) => s.rank!));

  // Calculate games played
  const gamesPlayed = {
    withRank: stats.filter((s) => s.rank).length,
    total: stats.length,
  };

  return {
    // Individual data
    friendsCount: friendsData?.total || 0,
    achievementsCount,
    totalGamesPlayed: historyData?.pagination?.total || 0,
    bestRank,
    gamesPlayed,
    stats,

    // Loading states
    isLoading,
    statsLoading,
  };
}
