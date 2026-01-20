const GAME_IDS = {
  CARO: 1,
  CARO_4: 2,
  SNAKE: 3,
  TIC_TAC_TOE: 4,
  MATCH3: 5,
  MEMORY: 6,
  DRAWING: 7,
};

const ACHIEVEMENT_RULES = [
  // ==========================================
  // 1. THÀNH TỰU DỄ (ĐỂ TEST NHANH)
  // ==========================================

  // Thành tựu chung: Hoàn thành bất kỳ 1 ván game nào
  {
    code: "TEST_FIRST_PLAY",
    name: "Chào mừng đến với Y36!",
    description: "Hoàn thành ván đấu đầu tiên của bạn",
    // Không có gameId nghĩa là áp dụng cho mọi game
    check: (stats) => stats.total_matches >= 1,
  },

  // Thành tựu Tic Tac Toe: Thắng chỉ 1 ván (Dễ test với AI Easy)
  {
    code: "TEST_TTT_QUICK_WIN",
    name: "Lính mới X-O",
    description: "Giành chiến thắng đầu tiên trong Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.total_wins >= 1,
  },

  // Thành tựu Snake: Chỉ cần ăn được 1-2 quả táo (đạt 2 điểm)
  {
    code: "TEST_SNAKE_EATER",
    name: "Miếng ăn đầu tiên",
    description: "Đạt mức điểm tối thiểu 2 trong game Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 2,
  },

  // ==========================================
  // 2. THÀNH TỰU CHÍNH (LOGIC THẬT)
  // ==========================================

  // TIC TAC TOE
  {
    code: "TTT_MASTER",
    name: "Bậc thầy X-O",
    description: "Thắng tổng cộng 20 ván Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.total_wins >= 20,
  },
  {
    code: "TTT_STREAK",
    name: "Bất bại",
    description: "Thắng liên tiếp 5 ván Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.win_streak >= 5,
  },

  // SNAKE
  {
    code: "SNAKE_HUNTER",
    name: "Thợ săn rắn",
    description: "Đạt 100 điểm trong Snake",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 100,
  },

  // CARO
  {
    code: "CARO_CHAMPION",
    name: "Cao thủ Gomoku",
    description: "Thắng tổng cộng 50 ván Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.total_wins >= 50,
  },
];

module.exports = ACHIEVEMENT_RULES;
