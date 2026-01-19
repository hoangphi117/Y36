const express = require("express");
const router = express.Router();

const AchievementController = require("../../controllers/customer/achievementController");
const AchievementService = require("../../services/AchievementService");

router.get(
  "/available/:gameId",
  AchievementController.getAvailableAchievements,
);
router.get("/:userId", AchievementController.getUserAchievements);
router.post("/unlock", AchievementController.unlockAchievement);

router.get("/", async (req, res) => {
  try {
    const data = await AchievementService.getUserAchievements(req.user.id);
    res.status(200).json({ data });
  } catch (err) {
    console.error("Fetch achievements error:", err);
    res.status(500).json({ message: "Không thể tải danh sách thành tựu" });
  }
});

module.exports = router;
