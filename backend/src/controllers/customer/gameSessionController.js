const GameSession = require("../../models/GameSession");
const Game = require("../../models/Game");

class GameSessionController {
  async startSession(req, res) {
    try {
      const userId = req.user.id;
      const { gameId, session_config } = req.body;

      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      const game = await Game.findActiveById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const existingSession = await GameSession.findActiveSession(
        userId,
        game.id,
      );
      if (existingSession) {
        return res.status(200).json({
          message: "Continue existing session",
          session: existingSession,
        });
      }

      const finalSessionConfig =
        session_config !== undefined
          ? session_config
          : (game.default_config ?? null);

      const [session] = await GameSession.createSession({
        user_id: userId,
        game_id: game.id,
        board_state: null,
        session_config: finalSessionConfig,
        status: "playing",
      });

      res.status(201).json({ message: "New game session started", session });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async saveSession(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { board_state, score, play_time_seconds, status } = req.body;

      const session = await GameSession.findById(id);
      if (!session || session.user_id !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      const isEditable =
        session.status === "playing" || session.status === "saved";
      const isSettingAbandoned = status === "abandoned";

      if (!isEditable && !isSettingAbandoned) {
        return res.status(400).json({
          message: "Cannot save a completed or abandoned session",
        });
      }

      const updateData = {};
      if (board_state !== undefined) updateData.board_state = board_state;
      if (score !== undefined) updateData.score = score;
      if (play_time_seconds !== undefined)
        updateData.play_time_seconds = play_time_seconds;

      if (status === "abandoned") {
        updateData.status = "abandoned";
      } else if (status === "saved") {
        updateData.status = "saved";
      }

      const [updatedSession] = await GameSession.updateById(id, updateData);

      return res.status(200).json({
        message: status === "abandoned" ? "Session abandoned" : "Session saved",
        session: updatedSession,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async completeSession(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { score, play_time_seconds } = req.body;

      const session = await GameSession.findById(id);
      if (!session || session.user_id !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status === "completed") {
        return res.status(400).json({
          message: "Session already completed",
        });
      }

      const [completedSession] = await GameSession.updateById(id, {
        status: "completed",
        score,
        play_time_seconds,
      });

      return res
        .status(200)
        .json({ message: "Session completed", session: completedSession });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async loadSession(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const session = await GameSession.findById(id);

      if (!session || session.user_id !== userId) {
        return res.status(404).json({
          message: "Session not found",
        });
      }

      if (session.status === "completed") {
        return res.status(400).json({
          message: "Cannot load a completed session",
        });
      }

      const [updatedSession] = await GameSession.updateById(id, {
        status: "playing",
      });

      return res.status(200).json({
        message: "Game session loaded successfully",
        session: updatedSession,
      });
    } catch (error) {
      console.error("LoadSession error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  async deleteSession(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const session = await GameSession.findById(id);
      if (!session || session.user_id !== userId) {
        return res.status(404).json({
          message: "Session not found",
        });
      }

      if (session.status === "playing") {
        return res.status(400).json({
          message: "Cannot delete an active session",
        });
      }

      await GameSession.deleteById(id);

      return res.status(200).json({
        message: "Game session deleted successfully",
      });
    } catch (error) {
      console.error("DeleteSession error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  async getSessionHistory(req, res) {
    try {
      const userId = req.user.id;

      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const gameId = req.query.gameId || null;

      const status = req.query.status || null;

      const sessions = await GameSession.findHistoryByUser(userId, {
        gameId,
        status,
        limit,
        offset,
      });

      const countResult = await GameSession.countHistoryByUser(
        userId,
        gameId,
        status,
      );
      const total = countResult?.total || 0;

      return res.status(200).json({
        message: "Session history fetched successfully",
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(total / limit),
        },
        data: sessions,
      });
    } catch (error) {
      return res.status(500).json({
        error: "error server",
        message: error.message,
      });
    }
  }
}

module.exports = new GameSessionController();
