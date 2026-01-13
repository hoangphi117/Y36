const express = require("express");
const {getGames,getGameById} = require("../../controllers/customer/gameController");

const router = express.Router();    
router.get("/", getGames);
router.get("/:id", getGameById);
module.exports = router;