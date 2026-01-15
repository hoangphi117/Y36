import type { BoardCard, MemorySessionSave } from "@/types/memoryGame";

const ICONS = [
  "icon1", "icon2", "icon3", "icon4", "icon5", "icon6",
  "icon7", "icon8", "icon9", "icon10", "icon11", "icon12",
  "icon13", "icon14", "icon15", "icon16"
];

/**
 * Convert game cards to board state for saving
 * @param cards - Array of cards with id and iconIndex
 * @param flipped - Array of flipped card indices
 * @param matched - Array of matched card indices
 * @returns Array of BoardCard objects
 */

interface Card {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export const convertCardsToBoardState = (
  cards: Card[],
  flipped: number[],
  matched: number[]
): BoardCard[] => {
  return cards.map((card) => ({
    id: card.id,
    value: ICONS[card.iconIndex] || `icon${card.iconIndex + 1}`,
    status: matched.includes(card.id)
      ? "matched"
      : flipped.includes(card.id)
        ? "flipped"
        : "hidden",
  }));
};

/**
 * Create a session save object from game state
 * @param board - Current board state
 * @param gameStatus - Current game status
 * @param timeLeft - Remaining time
 * @param currentLevel - Current level
 * @param moves - Number of moves
 * @param totalScore - Total score
 * @param mode - Game mode
 * @returns MemorySessionSave object ready to send to API
 */
export const createSessionSave = (
  board: BoardCard[],
  timeLeft: number,
  currentLevel: number,
  moves: number,
  totalScore: number,
): MemorySessionSave => {
  return {
    board_state: {
      cards: board,
      moves: moves,
      level: currentLevel,
    },
    score: totalScore,
    play_time_seconds: timeLeft,
  };
};
