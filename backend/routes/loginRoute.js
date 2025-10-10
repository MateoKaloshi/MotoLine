const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  login,
  register,
  logout,
} = require("../Controller/authenticate");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", authenticateToken, logout);

module.exports = router;
