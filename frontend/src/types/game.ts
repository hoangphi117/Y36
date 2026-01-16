export interface GameInfo {
  id: number;
  code: string;
  name: string;
  description: string;
  default_config: Record<string, any>;
}

export interface SessionConfig {
  turn_time?: number;
  time_limit?: number;
}

export interface TicTacToeBoardState {
  squares: ("X" | "O" | null)[];
  xIsNext: boolean;
  winner: string | null;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: number;
  status: "playing" | "finished" | "abandoned";
  score: number;
  play_time_seconds: number;
  board_state: TicTacToeBoardState | {};
  session_config: SessionConfig;
  started_at: string;
  updated_at: string;
}

export interface StartSessionResponse {
  message: string;
  session: GameSession;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GameHistoryResponse {
  message: string;
  pagination: Pagination;
  data: GameSession[];
}

export const GAME_ID_MAP: Record<number, string> = {
  1: "Cờ Caro 5 Ô",
  2: "Cờ Caro 4 Ô",
  3: "Rắn Săn Mồi",
  4: "Tic Tac Toe",
  5: "Kẹo Ngọt",
  6: "Lật Hình",
  7: "Bảng Vẽ",
};
