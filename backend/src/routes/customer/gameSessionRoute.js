const express = require("express");
const gameSessionController = require("../../controllers/customer/gameSessionController");

const router = express.Router();
router.post("/start", gameSessionController.startSession);
router.put("/:id/save", gameSessionController.saveSession);
router.put("/:id/complete", gameSessionController.completeSession);
router.get("/:id/load", gameSessionController.loadSession);
router.get("/history", gameSessionController.getSessionHistory);
router.delete("/:id", gameSessionController.deleteSession);    
module.exports = router;