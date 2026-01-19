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
  return cards.map((card, index) => ({
    id: index, // vị trí trong board (0, 1, 2, 3...)
    value: ICONS[card.iconIndex] || `icon${card.iconIndex + 1}`,
    status: matched.includes(index)
      ? "matched"
      : flipped.includes(index)
        ? "flipped"
        : "hidden",
  }));
};

/**
 * Restore cards from board state when loading saved session
 * @param boardCards - Array of BoardCard from saved session
 * @returns Object containing cards, flipped, and matched arrays
 */
export const restoreBoardState = (
  boardCards: BoardCard[]
): { cards: Card[], flipped: number[], matched: number[] } => {
  const cards: Card[] = boardCards.map((boardCard) => {
    // Parse iconIndex từ value (icon1 -> 0, icon2 -> 1, ...)
    const iconIndex = ICONS.indexOf(boardCard.value);
    
    return {
      id: boardCard.id,
      iconIndex: iconIndex >= 0 ? iconIndex : 0,
      isFlipped: boardCard.status === "flipped",
      isMatched: boardCard.status === "matched",
    };
  });

  const flipped = cards
    .filter(card => card.isFlipped)
    .map(card => card.id);
  
  const matched = cards
    .filter(card => card.isMatched)
    .map(card => card.id);

  return { cards, flipped, matched };
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
    cards: board,
    moves: moves,
    level: currentLevel,
    score: totalScore,
    time_left: timeLeft,
  };
};
