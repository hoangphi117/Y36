const db = require("../config/db");

class GameRating {
  static async getRating(gameId) {
    const result = await db("game_ratings")
      .where({ game_id: gameId })
      .avg("rating as rating")
      .first();
    return result.rating;
  }

  static async upsert({ user_id, game_id, rating }) {
    const [result] = await db("game_rating")
      .insert({
        user_id,
        game_id,
        rating,
      })
      .onConflict(["user_id", "game_id"])
      .merge({
        rating,
        updated_at: db.fn.now(),
      })
      .returning("*");

    return result;
  }

  static async findByUserAndGame(user_id, game_id) {
    return db(this.tableName).where({ user_id, game_id }).first();
  }

  static async getAverageByGame(game_id) {
    const result = await db(this.tableName)
      .where({ game_id })
      .avg("rating as average")
      .count("id as total")
      .first();

    return {
      average: Number(result.average) || 0,
      total: Number(result.total),
    };
  }

  static async delete(user_id, game_id) {
    return db("game_rating").where({ user_id, game_id }).del();
  }
}

module.exports = GameRating;
