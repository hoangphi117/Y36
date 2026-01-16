export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  status?: string;
}

export interface FriendsListResponse {
  page: number;
  limit: number;
  total: number;
  data: Friend[];
}
