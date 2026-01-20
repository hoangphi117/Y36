import { useState, useEffect } from "react";
import axiosClient from "@/lib/axios";
import { type RankingUser } from "@/types/rankingUser";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MyRankData {
  rank: number;
  score: number;
}

export function useRanking(
  gameId: number,
  scope: "global" | "friends" | "mine",
  page: number = 1,
  limit: number = 10,
) {
  const [data, setData] = useState<RankingUser[]>([]);
  const [myRank, setMyRank] = useState<MyRankData | null>(null);
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
        if (scope === "mine") {
          const res = await axiosClient.get("/rankings/me", {
             params: { gameId }
          });
          setMyRank(res.data.data);
          // Clear list data when in 'mine' mode
          setData([]); 
        } else {
          const res = await axiosClient.get("/rankings", {
            params: { gameId, scope, page, limit },
          });

          setData(res.data.data || []);
          setRankingType(res.data.rankingType);
          setMyRank(null); // Clear myRank when in list mode

          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ranking", error);
        setData([]);
        setMyRank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [gameId, scope, page, limit]);

  return {
    data,
    myRank,
    rankingType,
    loading,
    pagination,
  };
}
