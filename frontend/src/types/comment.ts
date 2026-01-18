export interface Comment {
  id: string;
  user_id: string;
  game_id: number;
  content: string;
  created_at: string;
  updated_at: string;

  username: string;
  avatar_url: string | null;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommentPayload {
  gameId: number;
  content: string;
}

export interface UpdateCommentPayload {
  id: string;
  content: string;
}
