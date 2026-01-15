const express = require("express");
const router = express.Router();

const { profile, updateMe, changePassword,searchUsers } = require("../controllers/userController");
router.get("/me", profile);   
router.put("/me", updateMe);
router.put("/me/password", changePassword);
router.get("/search", searchUsers);
module.exports = router;