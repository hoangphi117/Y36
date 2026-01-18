const express = require("express");
const router = express.Router();
const RankingController = require("../../controllers/customer/rankingController");

router.get("/", RankingController.getLeaderboard);

router.get("/me", RankingController.getUserRank);

module.exports = router;
