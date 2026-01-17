const express = require('express');
const CommentController = require('../../controllers/customer/commentController');

const router = express.Router();

router.post("/game/:gameId", CommentController.create);
router.get("/game/:gameId", CommentController.getByGame);

router.put("/:id", CommentController.update);
router.delete("/:id", CommentController.delete);

module.exports = router;