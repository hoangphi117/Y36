const express = require("express");
const router = express.Router();

const friendController = require("../../controllers/customer/friendController");

router.post("/request/:userId", friendController.sendFriendRequest);
module.exports = router;