const UserGameStats = require("../../models/UserGameStats");

class RankingController {
  async getLeaderboard(req, res) {
    try {
      const gameId = Number(req.query.gameId);
      const { scope } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const currentUserId = req.user.id;

      if (!gameId)
        return res.status(400).json({ message: "Game ID is required" });

      const COMPETITIVE_IDS = [1, 2, 4];
      const orderByColumn = COMPETITIVE_IDS.includes(gameId)
        ? "rank_points"
        : "high_score";

      const { data, total } = await UserGameStats.getLeaderboard(
        gameId,
        orderByColumn,
        scope,
        currentUserId,
        page,
        limit,
      );

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        data,
        rankingType: orderByColumn,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getUserRank(req, res) {
    try {
      const userId = req.user.id;
      const gameId = Number(req.query.gameId);
      if (!gameId)
        return res.status(400).json({ message: "Game ID is required" });

      const COMPETITIVE_IDS = [1, 2, 4];
      const orderByColumn = COMPETITIVE_IDS.includes(gameId)
        ? "rank_points"
        : "high_score";

      const myRank = await UserGameStats.getUserRank(
        userId,
        gameId,
        orderByColumn,
      );

      if (!myRank) {
        return res
          .status(200)
          .json({ rank: null, message: "User not ranked yet" });
      }

      return res.status(200).json({
        data: {
          rank: Number(myRank.rank_position),
          score: myRank.score,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RankingController();
