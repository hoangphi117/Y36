export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive" | "banned";

export interface User {
  user_id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  dark_mode: boolean;
  status: UserStatus;
  created_at: string;
}

export interface SearchUserResult {
  id: string;
  username: string;
  avatar_url: string | null;
  friend_status: string;
}

export interface SearchUsersResponse {
  results: number;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: SearchUserResult[];
}
