const express = require("express");
const router = express.Router();

const { login, register, logout } = require("../Controller/authenticate");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

module.exports = router;
