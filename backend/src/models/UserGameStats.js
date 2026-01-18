const db = require("../config/db");

class UserGameStats {
  static async findOne(userId, gameId) {
    return db("user_game_stats")
      .where({ user_id: userId, game_id: gameId })
      .first();
  }

  static async updateStats(userId, gameId, statsData) {
    const { score, isCompetitive, isWin } = statsData;

    let updateQuery = {};

    updateQuery.total_matches = db.raw("user_game_stats.total_matches + 1");

    updateQuery.last_updated_at = db.fn.now();

    if (isWin) {
      updateQuery.total_wins = db.raw("user_game_stats.total_wins + 1");
    }

    if (isCompetitive) {
      updateQuery.rank_points = db.raw("user_game_stats.rank_points + ?", [
        score,
      ]);
    } else {
      updateQuery.high_score = db.raw(
        "GREATEST(user_game_stats.high_score, ?)",
        [score],
      );
    }

    return db("user_game_stats")
      .insert({
        user_id: userId,
        game_id: gameId,
        high_score: !isCompetitive ? score : 0,
        rank_points: isCompetitive ? score : 0,
        total_matches: 1,
        total_wins: isWin ? 1 : 0,
        last_updated_at: new Date(),
      })
      .onConflict(["user_id", "game_id"])
      .merge(updateQuery);
  }

  static async getLeaderboard(
    gameId,
    orderByColumn,
    scope = "global",
    currentUserId = null,
    page = 1,
    limit = 10,
  ) {
    const offset = (page - 1) * limit;

    let baseQuery = db("user_game_stats as ugs")
      .join("users", "ugs.user_id", "users.id")
      .where("ugs.game_id", gameId);

    if (scope === "friends" && currentUserId) {
      baseQuery.whereIn("ugs.user_id", function () {
        this.select("user_id_2")
          .from("friendships")
          .where("user_id_1", currentUserId)
          .andWhere("status", "accepted")
          .union(function () {
            this.select("user_id_1")
              .from("friendships")
              .where("user_id_2", currentUserId)
              .andWhere("status", "accepted");
          })
          .union(function () {
            this.select(db.raw("?", [currentUserId]));
          });
      });
    }

    const countResult = await baseQuery.clone().count("* as total").first();
    const total = parseInt(countResult.total || 0);

    const data = await baseQuery
      .select(
        "users.id as user_id",
        "users.username",
        "users.avatar_url",
        "ugs.high_score",
        "ugs.rank_points",
        "ugs.total_wins",
        "ugs.total_matches",
      )
      .orderBy(orderByColumn, "desc")
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  static async getUserRank(userId, gameId, orderByColumn) {
    const rankQuery = `
      SELECT * FROM (
        SELECT 
          user_id,
          ${orderByColumn} as score,
          RANK() OVER (ORDER BY ${orderByColumn} DESC) as rank_position
        FROM user_game_stats
        WHERE game_id = ?
      ) as ranked
      WHERE user_id = ?
    `;
    const result = await db.raw(rankQuery, [gameId, userId]);
    return result.rows[0];
  }
}

module.exports = UserGameStats;
