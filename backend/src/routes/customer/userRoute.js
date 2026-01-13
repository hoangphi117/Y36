const userController = require('../../controllers/userController');
const express = require('express');
const router = express.Router();
router.put('/me', userController.updateMe);

module.exports = router;