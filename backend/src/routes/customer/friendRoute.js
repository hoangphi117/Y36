const express = require("express");
const router = express.Router();

const friendController = require("../../controllers/customer/friendController");

router.post("/request/:userId", friendController.sendFriendRequest);
router.put("/accept/:userId", friendController.acceptFriendRequest);
router.delete("/reject/:userId", friendController.rejectFriendRequest);
router.delete("/unfriend/:userId", friendController.unfriend);

router.get("/list", friendController.getFriends);


module.exports = router;