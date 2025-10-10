const express = require("express");
const router = express.Router();

const { post } = require("../Controller/ContactController");

router.post("/contact" , post);

module.exports = router;