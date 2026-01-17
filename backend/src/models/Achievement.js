const db = require("../config/db");

class Achievement {
  static async unlock({
    user_id,
    game_id = null,
    code,
    name,
    description = null,
  }) {
    const [row] = await db("achievements")
      .insert({
        user_id,
        game_id,
        code,
        name,
        description,
      })
      .onConflict(["user_id", "game_id", "code"])
      .ignore()
      .returning("*");

    return row;
  }


  static async getByUser(userId, { gameId = null } = {}) {
    const q = db("achievements")
      .where("user_id", userId)
      .orderBy("unlocked_at", "desc");

    if (gameId !== null) {
      q.andWhere("game_id", gameId);
    }

    return q;
  }

  static async getByFriend(friendId, { gameId = null } = {}) {
    const q = db("achievements")
      .where("user_id", friendId)
      .orderBy("unlocked_at", "desc");

    if (gameId !== null) {
      q.andWhere("game_id", gameId);
    }

    return q;
  }

  static async countByUser(userId, gameId = null) {
    const q = db("achievements")
      .where("user_id", userId);

    if (gameId !== null) {
      q.andWhere("game_id", gameId);
    }

    const [{ count }] = await q.count("* as count");
    return parseInt(count);
  }
}

module.exports = Achievement;
