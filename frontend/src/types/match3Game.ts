export interface default_config {
    rows: number;
    cols: number;
    time_limit: number;
    candy_types: number;
    moves_limit: number;
    target_score: number;
}

export interface IMatch3Game {
    id: string;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
    default_config: default_config;
    created_at: string;
}

export interface board_state {
    matrix: number[][];
    current_combo: number;
    moves_remaining?: number;
    time_remaining?: number;
}

export interface session_config {
    mode: string;
    ai_level: string;
    seed_version: string;
    default_config: default_config;
}

export interface Match3SessionResponse {
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

export interface Match3SessionSave {
    board_state: board_state;
    score: number;
    play_time_seconds?: number;
}