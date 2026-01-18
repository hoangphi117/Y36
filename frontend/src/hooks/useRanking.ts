import { useState, useEffect } from "react";
import axiosClient from "@/lib/axios";
import { type RankingUser } from "@/types/rankingUser";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useRanking(
  gameId: number,
  scope: "global" | "friends",
  page: number = 1,
  limit: number = 10,
) {
  const [data, setData] = useState<RankingUser[]>([]);
  const [rankingType, setRankingType] = useState<string>("rank_points");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get("/rankings", {
          params: { gameId, scope, page, limit },
        });

        setData(res.data.data || []);
        setRankingType(res.data.rankingType);

        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch ranking", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [gameId, scope, page, limit]);

  return {
    data,
    rankingType,
    loading,
    pagination,
  };
}
