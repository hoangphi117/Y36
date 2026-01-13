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
    return knex("game_sessions").where({ id }).del();
  }

  static async findHistoryByUser(userId, limit, offset) {
    return knex("game_sessions")
      .where({ user_id: userId })
      .whereNot({ status: "playing" })
      .orderBy("updated_at", "desc")
      .limit(limit)
      .offset(offset);
  }

  static async countHistoryByUser(userId) {
    return knex("game_sessions")
      .where({ user_id: userId })
      .whereNot({ status: "playing" })
      .count("* as total")
      .first();
  }
}

module.exports = GameSession;
