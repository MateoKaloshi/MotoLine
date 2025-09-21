// routes/loginRoute.js
const express = require("express");
const router = express.Router();

const { login, register, logout } = require("../Controller/authenticate");

// note the leading slashes on routes
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

module.exports = router;
