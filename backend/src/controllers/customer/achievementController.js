const Achievement = require("../../models/Achievement");

class AchievementController {
  async getUserAchievements(req, res) {
    try {
      const { userId } = req.params;

      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          error: "You are not allowed to view this user's achievements",
        });
      }

      const achievements = await Achievement.getUserAchievements(userId);

      res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async unlockAchievement(req, res) {
    try {
      const { game_id, code } = req.body;
      const userId = req.user.id;

      if (!game_id || !code) {
        return res.status(400).json({
          error: "game_id and code are required",
        });
      }

      const achievementDef =
        await Achievement.getAchievementDefinition(game_id, code);

      if (!achievementDef) {
        return res.status(400).json({
          error: "Invalid achievement code",
        });
      }

      const unlocked = await Achievement.unlock(
        userId,
        game_id,
        achievementDef
      );

      if (!unlocked) {
        return res.status(200).json({
          success: false,
          already_unlocked: true,
          message: "Achievement already unlocked",
        });
      }

      res.status(201).json({
        success: true,
        message: "Achievement unlocked",
        data: unlocked,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getAvailableAchievements(req, res) {
    try {
      const { gameId } = req.params;

      const achievements = await Achievement.getAvailableAchievements(
        parseInt(gameId)
      );

      res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      res.status(404).json({
        error: error.message,
      });
    }
  }
}

module.exports = new AchievementController();
