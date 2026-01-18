import {
  Grid3X3,
  SquaresExclude,
  Worm,
  Candy,
  BringToFront,
} from "lucide-react";

export const GAMES_META = [
  { id: 1, name: "Caro 5 hàng", icon: BringToFront, type: "rank_points" },
  { id: 2, name: "Caro 4 hàng", icon: BringToFront, type: "rank_points" },
  { id: 3, name: "Rắn Săn Mồi", icon: Worm, type: "high_score" },
  { id: 4, name: "Tic Tac Toe", icon: Grid3X3, type: "rank_points" },
  { id: 5, name: "Candy Crush", icon: Candy, type: "high_score" },
  { id: 6, name: "Cờ Trí Nhớ", icon: SquaresExclude, type: "high_score" },
];

export const getGameMeta = (id: number) => GAMES_META.find((g) => g.id === id);
