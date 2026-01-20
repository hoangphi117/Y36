const knex = require("../config/db");

const ACHIEVEMENT_RULES = require("../config/achievementRules");

class Achievement {
  static async getUserAchievements(userId, gameId = null) {
    let query = knex("achievements").where({ user_id: userId });

    if (gameId) {
      query = query.andWhere({ game_id: gameId });
    }

    return query.orderBy("unlocked_at", "desc");
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

  static async getAvailableAchievements(gameId) {
    return ACHIEVEMENT_RULES.filter((rule) => rule.gameId === gameId).map(
      (rule) => ({
        code: rule.code,
        name: rule.name,
        description: rule.description,
      }),
    );
  }

  static async getAchievementDefinition(gameId, code) {
    const rule = ACHIEVEMENT_RULES.find(
      (r) => r.gameId === gameId && r.code === code,
    );

    if (!rule) return null;

    return {
      code: rule.code,
      name: rule.name,
      description: rule.description,
    };
  }
}

module.exports = Achievement;
