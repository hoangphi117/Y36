const db = require("../config/db");

class GameRating {
  static async getRating(gameId) {
    const result = await db("game_ratings")
      .where({ game_id: gameId })
      .avg("rating as rating")
      .first();
    return result.rating;
  }
}

module.exports = GameRating;