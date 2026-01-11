const express = require('express');
const router = express.Router();
const { getGames, updateGame } = require('../../controllers/admin/gameController');

router.get('/', getGames);
router.put('/:id', updateGame);

module.exports = router;