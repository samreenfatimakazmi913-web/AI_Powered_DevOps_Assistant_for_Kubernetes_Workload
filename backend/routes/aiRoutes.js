const express = require("express");
const router = express.Router();
const { handleAIQuery } = require("../controllers/aiController");

router.post("/query", handleAIQuery);

module.exports = router;
