export interface UserRating {
  id: string;
  user_id: string;
  game_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AverageRatingResponse {
  game_id: number;
  average_rating: number;
  total_ratings: number;
}
