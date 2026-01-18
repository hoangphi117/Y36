const knex = require("../config/db");

class Achievement {
  static async getUserAchievements(userId) {
    return knex("achievements")
      .where({ user_id: userId })
      .orderBy("unlocked_at", "desc");
  }

  static async unlock(userId, gameId, achievementDef) {
    try {
      const [row] = await knex("achievements")
        .insert({
          user_id: userId,
          game_id: gameId,
          code: achievementDef.code,
          name: achievementDef.name,
          description: achievementDef.description,
        })
        .returning("*");

      return row;
    } catch (error) {
      if (error.code === "23505") return null;
      throw error;
    }
  }


  static achievementDefinitions = {
      snake: [
        { code: 'first_apple', name: 'Quả táo đầu tiên', description: 'Ăn được quả táo đầu tiên' },
        { code: 'score_10', name: 'Người mới bắt đầu', description: 'Đạt 10 điểm' },
        { code: 'score_50', name: 'Cao thủ rắn săn', description: 'Đạt 50 điểm' },
        { code: 'score_100', name: 'Huyền thoại', description: 'Đạt 100 điểm' },
        { code: 'no_death_5min', name: 'Sống sót', description: 'Chơi 5 phút không chết' },
      ],
      caro: [
        { code: 'first_win', name: 'Chiến thắng đầu tiên', description: 'Thắng ván cờ caro đầu tiên' },
        { code: 'win_streak_3', name: 'Chuỗi thắng', description: 'Thắng liên tiếp 3 ván' },
        { code: 'total_wins_10', name: 'Kỳ thủ', description: 'Thắng tổng cộng 10 ván' },
        { code: 'total_wins_50', name: 'Cao thủ Gomoku', description: 'Thắng tổng cộng 50 ván' },
        { code: 'win_5x5', name: 'Bàn nhỏ', description: 'Thắng trên bàn 5x5' },
      ],
      'caro-4': [
        { code: 'first_win', name: 'Chiến thắng đầu tiên', description: 'Thắng ván cờ caro 4 đầu tiên' },
        { code: 'total_wins_10', name: 'Kỳ thủ', description: 'Thắng tổng cộng 10 ván' },
        { code: 'perfect_block', name: 'Phòng thủ hoàn hảo', description: 'Chặn đối thủ 5 lần trong 1 ván' },
      ],
      "tic-tac-toe": [
        { code: "first_win", name: "Chiến thắng đầu tiên", description: "Thắng ván tic tac toe đầu tiên" },
        { code: "perfect_game", name: "Ván đấu hoàn hảo", description: "Thắng trong 3 nước" },
        { code: "total_wins_20", name: "Bậc thầy X-O", description: "Thắng tổng cộng 20 ván" },
        { code: "win_streak_5", name: "Bất bại", description: "Thắng liên tiếp 5 ván" },
      ],
      'match3': [
        { code: 'first_match', name: 'Ghép đầu tiên', description: 'Ghép 3 viên đầu tiên' },
        { code: 'combo_5', name: 'Combo', description: 'Ghép liên tiếp 5 lần' },
        { code: 'score_1000', name: 'Cao thủ ghép hình', description: 'Đạt 1000 điểm' },
        { code: 'clear_board', name: 'Bàn sạch', description: 'Xóa sạch toàn bộ bàn chơi' },
      ],
      'memory': [
        { code: 'first_pair', name: 'Cặp đầu tiên', description: 'Tìm được cặp đầu tiên' },
        { code: 'perfect_memory', name: 'Trí nhớ siêu phàm', description: 'Hoàn thành không sai lần nào' },
        { code: 'speed_demon', name: 'Tốc độ', description: 'Hoàn thành trong 30 giây' },
        { code: 'complete_10', name: 'Luyện não', description: 'Hoàn thành 10 ván' },
      ],
      'drawing': [
        { code: 'first_draw', name: 'Nét vẽ đầu tiên', description: 'Hoàn thành bức vẽ đầu tiên' },
        { code: 'color_master', name: 'Họa sĩ màu sắc', description: 'Sử dụng 10 màu khác nhau' },
        { code: 'big_canvas', name: 'Tranh lớn', description: 'Vẽ tranh 500x500 pixel' },
        { code: 'share_5', name: 'Chia sẻ nghệ thuật', description: 'Chia sẻ 5 bức tranh' },
      ],
  };

  static async getAvailableAchievements(gameId) {
    const game = await knex("games").where({ id: gameId }).first();
    if (!game) throw new Error("Game not found");

    return this.achievementDefinitions[game.code] || [];
  }

  static async getAchievementDefinition(gameId, code) {
    const defs = await this.getAvailableAchievements(gameId);
    return defs.find((a) => a.code === code) || null;
  }
}

module.exports = Achievement;
