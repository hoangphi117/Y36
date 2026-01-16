const db = require("../config/db");

class GameSession {
  static async createSession(sessionData) {
    return db("game_sessions").insert(sessionData).returning("*");
  }

  static async findActiveSession(userId, gameId) {
    return db("game_sessions")
      .where({ user_id: userId, game_id: gameId, status: "active" })
      .first();
  }

  static async findByUser(userId) {
    return db("game_sessions")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  }
  static async updateById(id, data) {
    return db("game_sessions")
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning("*");
  }

  static async findById(id) {
    return db("game_sessions").where({ id }).first();
  }

  static async deleteById(id) {
    return db("game_sessions").where({ id }).del();
  }

  static async findHistoryByUser(
    userId,
    { gameId = null, limit = 10, offset = 0 }
  ) {
    const query = db("game_sessions")
      .where({ user_id: userId })
      .whereNot({ status: "playing" });

    if (gameId) {
      query.andWhere("game_id", gameId);
    }

    return query.orderBy("updated_at", "desc").limit(limit).offset(offset);
  }

  static async countHistoryByUser(userId, gameId = null) {
    const query = db("game_sessions")
      .where({ user_id: userId })
      .whereNot({ status: "playing" });

    if (gameId) {
      query.andWhere("game_id", gameId);
    }

    const result = await query.count("* as total").first();
    return Number(result.total);
  }
}

module.exports = GameSession;
