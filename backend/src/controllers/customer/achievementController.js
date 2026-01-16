const Achievement = require("../../models/Achievement");

class AchievementController {
  async unlock(req, res) {
    try {
      const userId = req.user.id;
      const { game_id, code, name, description } = req.body;

      if (!code || !name) {
        return res.status(400).json({
          message: "code and name are required",
        });
      }

      const achievement = await Achievement.unlock({
        user_id: userId,
        game_id,
        code,
        name,
        description,
      });

      if (!achievement) {
        return res.status(200).json({
          message: "Achievement already unlocked",
        });
      }

      return res.status(201).json({
        message: "Achievement unlocked",
        data: achievement,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  
}
