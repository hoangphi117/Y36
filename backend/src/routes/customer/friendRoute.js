const express = require("express");
const router = express.Router();

const friendController = require("../../controllers/customer/friendController");

router.post("/request/:userId", friendController.sendFriendRequest);
router.post("/accept/:userId", friendController.acceptFriendRequest);
router.post("/reject/:userId", friendController.rejectFriendRequest);
router.delete("/unfriend/:userId", friendController.unfriend);
router.post("/block/:userId",friendController.blockUser)

router.get("/list", friendController.getFriends);
router.get('/requests/incoming', friendController.getIncomingRequests);
router.get('/requests/outgoing', friendController.getOutgoingRequests);


module.exports = router;