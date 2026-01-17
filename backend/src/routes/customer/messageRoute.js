const express = require('express');

const router = express.Router();
const messageController = require('../../controllers/customer/messageController');

router.post("/:userId", messageController.sendMessage);
router.get("/:userId", messageController.getConversation);
router.get("/", messageController.getConversations);
router.patch("/read/:userId", messageController.markAsRead);
router.get("/unread/count", messageController.countUnread);
router.delete("/:messageId", messageController.deleteMessage);

module.exports = router;