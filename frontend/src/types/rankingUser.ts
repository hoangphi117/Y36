export interface RankingUser {
  user_id: string;
  username: string;
  avatar_url: string;
  high_score?: number;
  rank_points?: number;
  total_wins?: number;
  total_matches?: number;
}
