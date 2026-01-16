const Message = require("../../models/Message");

class MessageController {
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { userId: receiverId } = req.params;

      if (!receiverId) {
        return res.status(400).json({
          message: "receiverId is required",
        });
      }

      if (senderId === receiverId) {
        return res
          .status(400)
          .json({ message: "Cannot send message to yourself" });
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({
          message: "content are required",
        });
      }

      const message = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      });

      return res.status(201).json({
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: otherUserId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!otherUserId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const conversation = await Message.getConversation(
        currentUserId,
        otherUserId,
        { page, limit }
      );

      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const conversations = await Message.getConversations(userId);

      return res.status(200).json({
        total: conversations.length,
        data: conversations,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: otherUserId } = req.params;

      if (!otherUserId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const updated = await Message.markAsRead(currentUserId, otherUserId);

      return res.status(200).json({
        message: "Messages marked as read",
        updated,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}
