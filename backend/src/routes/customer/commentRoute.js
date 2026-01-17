const express = require('express');
const CommentController = require('../../controllers/customer/commentController');

const router = express.Router();

router.post("/create",  CommentController.create);
router.put("/:id", CommentController.update);
router.delete("/:id", CommentController.delete);

router.get("/getComments", CommentController.getByGame);

module.exports = router;