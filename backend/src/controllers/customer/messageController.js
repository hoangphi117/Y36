const Message = require("../../models/Message");

class MessageController {
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { userId: receiverId } = req.params;

      if (senderId === receiverId) {
        return res
          .status(400)
          .json({ message: "Cannot send message to yourself" });
      }

      const content = req.body;
      if (!content) {
        return res.status(400).json({
          message: "content are required",
        });
      }

      await Message.create(senderId,receiverId,content);

      return res.status(201).json({
        message: "Message sent successfully",
      })
    } catch (error) {
        return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}
