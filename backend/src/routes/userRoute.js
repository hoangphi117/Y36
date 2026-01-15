const express = require("express");
const router = express.Router();

const { profile, updateMe, changePassword } = require("../controllers/userController");
router.get("/me", profile);   
router.put("/me", updateMe);
router.put("/me/password", changePassword);
module.exports = router;