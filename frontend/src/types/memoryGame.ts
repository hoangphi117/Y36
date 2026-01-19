// Card structure for board state
export interface BoardCard {
  id: number;
  value: string; 
  status: "matched" | "hidden" | "flipped"; 
}

export interface board_state {
    cards: BoardCard[];
    moves?: number;
    level?: number;
}

export interface session_config {
    mode: string;
    ai_level: string;
    seed_version: string;
    default_config: default_config;
}

export interface MemorySessionResponse {
  session: {
    id: string;
    user_id: string;
    game_id: string;
    status: string;
    score: number;
    play_time_seconds: number;
    board_state: board_state;
    session_config: session_config;
    created_at: string;
    updated_at: string;
  };
}

export interface default_config {
    rows: number;
    cols: number;
    theme: string;
    time_limit: number;
}

export interface IMemoryGame {
    id: string;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
    default_config: default_config;
    created_at: string;
}

export interface MemorySessionSave {
    cards: BoardCard[];
    moves: number;
    level: number;
    score: number;
    time_left: number;
}