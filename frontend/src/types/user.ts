export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive" | "banned";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  dark_mode: boolean;
  status: UserStatus;
  created_at: string;
}
