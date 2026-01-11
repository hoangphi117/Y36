const express = require('express');
const router = express.Router();
const { getGames, updateGame } = require('../../controllers/admin/gameController');

router.get('/games', getGames);
router.put('/games/:id', updateGame);

module.exports = router;