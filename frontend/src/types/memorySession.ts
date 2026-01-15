// Card structure for board state
export interface BoardCard {
  id: number;
  value: string; // Icon name or identifier
  status: "matched" | "hidden" | "flipped"; // matched = đã ghép, hidden = đang úp, flipped = lật ngửa
}

// Complete game session state
export interface MemorySessionSave {
  board: BoardCard[]; // Current board state
  gameStatus: "playing" | "completed" | "lost"; // Current game status
  timeLeft: number; // Remaining time in seconds
  currentLevel: number; // Current level (for level mode)
  moves: number; // Number of moves made
  totalScore: number; // Total score
  mode: "level" | "free"; // Game mode
}