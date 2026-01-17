const express = require("express");
const GameRatingController = require('../../controllers/customer/gameRatingController')

const router = express.Router();

router.post("/:gameId",GameRatingController.rateGame);
router.get("/:gameId/me",GameRatingController.getMyRating);
router.get("/:gameId/average",GameRatingController.getGameAverage);
router.delete("/:gameId",GameRatingController.deleteRating);

module.exports = router;
