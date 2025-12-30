const express = require("express");
const Team = require("../models/Team");

const router = express.Router();

/* ---------------- CREATE TEAM ---------------- */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Team name required" });
    }

    const exists = await Team.findOne({ name });
    if (exists) {
      return res.status(400).json({ error: "Team already exists" });
    }

    const team = await Team.create({ name });
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET ALL TEAMS ---------------- */
router.get("/", async (req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });
  res.json(teams);
});

module.exports = router;
