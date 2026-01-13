const express = require("express");
const gameController = require("../../controllers/customer/gameController");

const router = express.Router();    
router.get("/", gameController.listGames);
router.get("/:id", gameController.getGameByCode);
module.exports = router;