const express = require("express");
const Team = require("../models/Team");

const router = express.Router();

/* ---------------- CREATE TEAM ---------------- */
router.post("/", async (req, res) => {
  try {
    const { name, namespace } = req.body;

    if (!name || !namespace) {
      return res
        .status(400)
        .json({ message: "Team name and namespace are required" });
    }

    // Check duplicate name OR namespace
    const exists = await Team.findOne({
      $or: [{ name }, { namespace }],
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: "Team name or namespace already exists" });
    }

    const team = await Team.create({ name, namespace });
    res.status(201).json(team);
  } catch (err) {
    console.error("CREATE TEAM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- GET ALL TEAMS ---------------- */
router.get("/", async (req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });
  res.json(teams);
});

module.exports = router;
