const Comment = require("../../models/Comment");

class CommentController {
  async create(req, res) {
    try {
      const user_id = req.user.id;
      const { gameId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          message: "content is required",
        });
      }

      const comment = await Comment.create({
        user_id,
        game_id: gameId,
        content,
      });

      res.status(201).json({
        message: "Comment created successfully",
        data: comment,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByGame(req, res) {
    try {
      const { gameId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await Comment.findByGameId(gameId, {
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found",
        });
      }

      if (comment.user_id !== userId) {
        return res.status(403).json({
          message: "Can not edit comment",
        });
      }

      const updatedComment = await Comment.updateById(id, content);

      res.status(200).json({
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found",
        });
      }

      if (comment.user_id !== userId) {
        return res.status(403).json({
          message: "can not delete comment",
        });
      }

      await Comment.deleteById(id);

      res.status(200).json({
        message: "Comment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CommentController();
