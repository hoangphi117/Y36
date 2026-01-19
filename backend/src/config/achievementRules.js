// Định nghĩa danh sách các thành tựu và điều kiện
// code: Mã duy nhất
// type: 'point' (điểm số/elo), 'count' (số trận/số thắng)
// target: mốc cần đạt
const ACHIEVEMENT_RULES = [
  // --- CHUNG CHO MỌI GAME ---
  {
    code: "FIRST_BLOOD",
    name: "Vạn sự khởi đầu nan",
    description: "Hoàn thành ván chơi đầu tiên",
    check: (stats) => stats.total_matches >= 1,
  },
  {
    code: "NOVICE",
    name: "Tập sự",
    description: "Chơi tổng cộng 10 ván",
    check: (stats) => stats.total_matches >= 10,
  },
  {
    code: "VETERAN",
    name: "Lão làng",
    description: "Chơi tổng cộng 50 ván",
    check: (stats) => stats.total_matches >= 50,
  },

  // --- GAME ĐỐI KHÁNG (Caro, TicTacToe) ---
  {
    code: "WINNER_1",
    name: "Chiến thắng đầu tay",
    description: "Giành chiến thắng đầu tiên",
    check: (stats) => stats.total_wins >= 1,
  },
  {
    code: "MASTER_ELO",
    name: "Bậc thầy chiến thuật",
    description: "Đạt 50 điểm Rank (Elo)",
    check: (stats) => stats.rank_points >= 50,
  },

  // --- GAME ĐIỂM SỐ (Snake, Match3) ---
  {
    code: "SNAKE_HUNTER",
    name: "Thợ săn rắn",
    description: "Đạt 1000 điểm trong Snake",
    gameId: 3, // Chỉ áp dụng cho Snake
    check: (stats) => stats.high_score >= 1000,
  },
  {
    code: "GODLIKE_SNAKE",
    name: "Thần Rắn",
    description: "Đạt 5000 điểm trong Snake",
    gameId: 3,
    check: (stats) => stats.high_score >= 5000,
  },
];

module.exports = ACHIEVEMENT_RULES;
