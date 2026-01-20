import type { BoardCard, MemorySessionSave } from "@/types/memoryGame";

const ICONS = [
  "icon1", "icon2", "icon3", "icon4", "icon5", "icon6",
  "icon7", "icon8", "icon9", "icon10", "icon11", "icon12",
  "icon13", "icon14", "icon15", "icon16"
];

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

export const restoreBoardState = (
  boardCards: BoardCard[]
): { cards: Card[], flipped: number[], matched: number[] } => {
  const cards: Card[] = boardCards.map((boardCard) => {
    // Parse iconIndex 
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
