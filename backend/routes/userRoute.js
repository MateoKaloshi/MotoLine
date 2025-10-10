const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  updateEmail,
} = require("../Controller/UserController");
const { authenticateToken } = require("../Controller/authenticate");

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);
router.put("/change-email", authenticateToken, updateEmail);
module.exports = router;
