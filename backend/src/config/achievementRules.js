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
  // 1. THÀNH TỰU CHUNG
  // ==========================================
  {
    code: "TEST_FIRST_PLAY",
    name: "Chào mừng đến với Y36!",
    description: "Hoàn thành ván đấu đầu tiên của bạn",
    gameId: null, // System achievement
    check: (stats) => stats.total_matches >= 1,
  },

  // ==========================================
  // 2. CARO (ID: 1)
  // ==========================================
  {
    code: "CARO_BEGINNER",
    name: "Tập sự Caro",
    description: "Giành được 5 chiến thắng trong Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.total_wins >= 5,
  },
  {
    code: "CARO_NOVICE",
    name: "Kỳ thủ Caro",
    description: "Giành được 15 chiến thắng trong Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.total_wins >= 15,
  },
  {
    code: "CARO_ELITE",
    name: "Cao thủ Caro",
    description: "Đạt 200 điểm Elo trong Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.rank_points >= 200,
  },
  {
    code: "CARO_MASTER",
    name: "Đại sư Caro",
    description: "Đạt 500 điểm Elo trong Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.rank_points >= 500,
  },
  {
    code: "CARO_VETERAN",
    name: "Lão làng Caro",
    description: "Hoàn thành 50 ván đấu Caro",
    gameId: GAME_IDS.CARO,
    check: (stats) => stats.total_matches >= 50,
  },

  // ==========================================
  // 3. CARO 4x4 (ID: 2)
  // ==========================================
  {
    code: "CARO4_BEGINNER",
    name: "Khởi đầu Caro 4x4",
    description: "Giành 5 chiến thắng trong Caro 4x4",
    gameId: GAME_IDS.CARO_4,
    check: (stats) => stats.total_wins >= 5,
  },
  {
    code: "CARO4_NOVICE",
    name: "Kỳ thủ 4x4",
    description: "Giành 15 chiến thắng trong Caro 4x4",
    gameId: GAME_IDS.CARO_4,
    check: (stats) => stats.total_wins >= 15,
  },
  {
    code: "CARO4_ELITE",
    name: "Tinh anh 4x4",
    description: "Đạt 150 điểm Elo trong Caro 4x4",
    gameId: GAME_IDS.CARO_4,
    check: (stats) => stats.rank_points >= 150,
  },
  {
    code: "CARO4_MASTER",
    name: "Bậc thầy 4x4",
    description: "Đạt 300 điểm Elo trong Caro 4x4",
    gameId: GAME_IDS.CARO_4,
    check: (stats) => stats.rank_points >= 300,
  },
  {
    code: "CARO4_VETERAN",
    name: "Kỳ cựu 4x4",
    description: "Chơi 40 ván Caro 4x4",
    gameId: GAME_IDS.CARO_4,
    check: (stats) => stats.total_matches >= 40,
  },

  // ==========================================
  // 4. SNAKE (ID: 3)
  // ==========================================
  {
    code: "SNAKE_NOVICE",
    name: "Rắn nhỏ",
    description: "Đạt 20 điểm trong Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 20,
  },
  {
    code: "SNAKE_EXPERT",
    name: "Rắn trưởng thành",
    description: "Đạt 50 điểm trong Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 50,
  },
  {
    code: "SNAKE_MASTER",
    name: "Xà vương",
    description: "Đạt 150 điểm trong Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 150,
  },
  {
    code: "SNAKE_VETERAN",
    name: "Huấn luyện viên rắn",
    description: "Chơi 30 ván Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.total_matches >= 30,
  },
  {
    code: "SNAKE_LEGEND",
    name: "Huyền thoại mãng xà",
    description: "Đạt 300 điểm trong Rắn săn mồi",
    gameId: GAME_IDS.SNAKE,
    check: (stats) => stats.high_score >= 300,
  },

  // ==========================================
  // 5. TIC TAC TOE (ID: 4)
  // ==========================================
  {
    code: "TTT_BEGINNER",
    name: "Nhập môn X-O",
    description: "Giành 5 chiến thắng trong Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.total_wins >= 5,
  },
  {
    code: "TTT_NOVICE",
    name: "Kỳ thủ X-O",
    description: "Giành 15 chiến thắng trong Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.total_wins >= 15,
  },
  {
    code: "TTT_ELITE",
    name: "Tinh anh X-O",
    description: "Đạt 100 điểm Elo trong Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.rank_points >= 100,
  },
  {
    code: "TTT_MASTER",
    name: "Bậc thầy X-O",
    description: "Đạt 250 điểm Elo trong Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.rank_points >= 250,
  },
  {
    code: "TTT_VETERAN",
    name: "Kỳ cựu X-O",
    description: "Chơi 40 ván Tic Tac Toe",
    gameId: GAME_IDS.TIC_TAC_TOE,
    check: (stats) => stats.total_matches >= 40,
  },

  // ==========================================
  // 6. MATCH3 (ID: 5)
  // ==========================================
  {
    code: "MATCH3_BEGINNER",
    name: "Người mới xếp gạch",
    description: "Đạt 1,000 điểm trong Match3",
    gameId: GAME_IDS.MATCH3,
    check: (stats) => stats.high_score >= 1000,
  },
  {
    code: "MATCH3_NOVICE",
    name: "Thợ xếp gạch",
    description: "Đạt 5,000 điểm trong Match3",
    gameId: GAME_IDS.MATCH3,
    check: (stats) => stats.high_score >= 5000,
  },
  {
    code: "MATCH3_EXPERT",
    name: "Chuyên gia Match3",
    description: "Đạt 15,000 điểm trong Match3",
    gameId: GAME_IDS.MATCH3,
    check: (stats) => stats.high_score >= 15000,
  },
  {
    code: "MATCH3_VETERAN",
    name: "Kỳ cựu xếp gạch",
    description: "Chơi 20 ván Match3",
    gameId: GAME_IDS.MATCH3,
    check: (stats) => stats.total_matches >= 20,
  },
  {
    code: "MATCH3_LEGEND",
    name: "Huyền thoại Match3",
    description: "Đạt 30,000 điểm trong Match3",
    gameId: GAME_IDS.MATCH3,
    check: (stats) => stats.high_score >= 30000,
  },

  // ==========================================
  // 7. MEMORY (ID: 6)
  // ==========================================
  {
    code: "MEMORY_BEGINNER",
    name: "Trí nhớ tốt",
    description: "Đạt 20 điểm trong Trí nhớ",
    gameId: GAME_IDS.MEMORY,
    check: (stats) => stats.high_score >= 20,
  },
  {
    code: "MEMORY_NOVICE",
    name: "Trí nhớ siêu phàm",
    description: "Đạt 60 điểm trong Trí nhớ",
    gameId: GAME_IDS.MEMORY,
    check: (stats) => stats.high_score >= 60,
  },
  {
    code: "MEMORY_EXPERT",
    name: "Bậc thầy trí nhớ",
    description: "Đạt 120 điểm trong Trí nhớ",
    gameId: GAME_IDS.MEMORY,
    check: (stats) => stats.high_score >= 120,
  },
  {
    code: "MEMORY_VETERAN",
    name: "Người rèn luyện trí tâm",
    description: "Chơi 25 ván game Trí nhớ",
    gameId: GAME_IDS.MEMORY,
    check: (stats) => stats.total_matches >= 25,
  },
  {
    code: "MEMORY_MASTER",
    name: "Thần đồng trí nhớ",
    description: "Đạt 200 điểm trong Trí nhớ",
    gameId: GAME_IDS.MEMORY,
    check: (stats) => stats.high_score >= 200,
  },

  // ==========================================
  // 8. DRAWING (ID: 7)
  // ==========================================
  {
    code: "DRAWING_BEGINNER",
    name: "Họa sĩ tập sự",
    description: "Hoàn thành 5 bức vẽ",
    gameId: GAME_IDS.DRAWING,
    check: (stats) => stats.total_matches >= 5,
  },
  {
    code: "DRAWING_NOVICE",
    name: "Họa sĩ triển vọng",
    description: "Hoàn thành 15 bức vẽ",
    gameId: GAME_IDS.DRAWING,
    check: (stats) => stats.total_matches >= 15,
  },
  {
    code: "DRAWING_VETERAN",
    name: "Họa sĩ thực thụ",
    description: "Hoàn thành 30 bức vẽ",
    gameId: GAME_IDS.DRAWING,
    check: (stats) => stats.total_matches >= 30,
  },
  {
    code: "DRAWING_REGULAR",
    name: "Nghệ sĩ chăm chỉ",
    description: "Hoàn thành 50 bức vẽ",
    gameId: GAME_IDS.DRAWING,
    check: (stats) => stats.total_matches >= 50,
  },
  {
    code: "DRAWING_ARTIST",
    name: "Danh họa Y36",
    description: "Hoàn thành 100 bức vẽ",
    gameId: GAME_IDS.DRAWING,
    check: (stats) => stats.total_matches >= 100,
  },
];

module.exports = ACHIEVEMENT_RULES;
