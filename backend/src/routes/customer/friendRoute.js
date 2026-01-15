const express = require("express");
const router = express.Router();

const friendController = require("../../controllers/customer/friendController");

router.post("/request/:userId", friendController.sendFriendRequest);
router.post("/accept/:userId", friendController.acceptFriendRequest);
module.exports = router;