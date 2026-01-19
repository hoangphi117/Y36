const db = require("../config/db");
const ACHIEVEMENT_RULES = require("../config/achievementRules");

class AchievementService {
  /**
   * Kiểm tra và mở khóa thành tựu sau khi chơi xong
   * @param {string} userId - ID người chơi
   * @param {number} gameId - ID game vừa chơi
   */
  async checkAndUnlock(userId, gameId) {
    try {
      // 1. Lấy thống kê hiện tại của user
      const stats = await db("user_game_stats")
        .where({ user_id: userId, game_id: gameId })
        .first();

      if (!stats) return [];

      // 2. Lấy danh sách thành tựu User ĐÃ đạt được trước đó
      const existingAchievements = await db("achievements")
        .where({ user_id: userId }) // Lấy hết để check, hoặc lọc thêm game_id nếu cần
        .select("code");

      const existingCodes = new Set(existingAchievements.map((a) => a.code));
      const newUnlocked = [];

      // 3. Duyệt qua bộ luật để kiểm tra
      for (const rule of ACHIEVEMENT_RULES) {
        // Nếu đã đạt rồi thì bỏ qua
        if (existingCodes.has(rule.code)) continue;

        // Nếu rule dành riêng cho game cụ thể mà không khớp -> bỏ qua
        if (rule.gameId && rule.gameId !== gameId) continue;

        // KIỂM TRA ĐIỀU KIỆN
        if (rule.check(stats)) {
          // Thỏa mãn -> Thêm vào danh sách cần insert
          newUnlocked.push({
            user_id: userId,
            game_id: gameId,
            code: rule.code,
            name: rule.name,
            description: rule.description,
            unlocked_at: new Date(),
          });
        }
      }

      // 4. Lưu vào Database (nếu có cái mới)
      if (newUnlocked.length > 0) {
        await db("achievements").insert(newUnlocked);
      }

      return newUnlocked; // Trả về để hiển thị thông báo cho User
    } catch (error) {
      console.error("Check Achievement Error:", error);
      return [];
    }
  }

  // Lấy danh sách thành tựu của User (để hiển thị Profile)
  async getUserAchievements(userId) {
    // Join với bảng games để lấy tên game (nếu cần)
    return db("achievements")
      .select("*")
      .where("user_id", userId)
      .orderBy("unlocked_at", "desc");
  }
}

module.exports = new AchievementService();
