const express = require('express')
const router = express.Router();

const AchievementController = require('../../controllers/customer/achievementController')

router.get('/available/:gameId',AchievementController.getAvailableAchievements);
router.get('/:userId',AchievementController.getUserAchievements);
router.post('/unlock',AchievementController.unlockAchievement);

module.exports = router;