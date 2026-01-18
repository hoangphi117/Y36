const GameRating = require("../../models/GameRating");
const Game = require("../../models/Game");

class GameRatingController {
  async rateGame(req, res) {
    try {
      const userId = req.user.id;
      const { gameId } = req.params;
      const { rating } = req.body;

      if (!rating) {
        return res.status(400).json({
          message: "Rating is required",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      const game = await Game.findActiveById(gameId);
      if (!game) {
        return res.status(404).json({
          message: "Game not found",
        });
      }

      const result = await GameRating.upsert({
        user_id: userId,
        game_id: game.id,
        rating,
      });

      return res.status(200).json({
        message: "Rating saved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getMyRating(req, res) {
    try {
      const userId = req.user.id;
      const { gameId } = req.params;

      const rating = await GameRating.findByUserAndGame(userId, gameId);

      if (!rating) {
        return res.status(404).json({
          message: "Rating not found",
        });
      }

      return res.status(200).json({
        data: rating,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getGameAverage(req, res) {
    try {
      const { gameId } = req.params;

      const result = await GameRating.getAverageByGame(gameId);

      return res.status(200).json({
        game_id: Number(gameId),
        average_rating: result.average,
        total_ratings: result.total,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async deleteRating(req, res) {
    try {
      const userId = req.user.id;
      const { gameId } = req.params;

      const rating = await GameRating.findByUserAndGame(userId, gameId);

      if (!rating) {
        return res.status(404).json({
          message: "Rating not found",
        });
      }

      await GameRating.delete(userId, gameId);

      return res.status(200).json({
        message: "Rating deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = new GameRatingController();
