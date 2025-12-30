const express = require("express");
const User = require("../models/User");
const Team = require("../models/Team");

const router = express.Router();

/* ---------------- CREATE USER (ADMIN) ---------------- */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, teamId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    let team = null;
    if (teamId) {
      team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: "Invalid team" });
      }
    }

    const user = await User.create({
      name,
      email,
      password,   // demo project → plain text OK
      role,
      team: team ? team._id : null,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET ALL DEVELOPERS ---------------- */
router.get("/", async (req, res) => {
  const users = await User.find({ role: "developer" }).populate("team");
  res.json(users);
});

module.exports = router;
