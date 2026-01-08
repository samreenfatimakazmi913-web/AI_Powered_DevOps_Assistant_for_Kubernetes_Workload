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


const upload = require("../middleware/upload");

/* ---------------- UPLOAD PROFILE IMAGE ---------------- */
router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Profile image updated",
      image: user.profileImage,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ---------------- DELETE PROFILE IMAGE ---------------- */
router.delete("/delete-avatar/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // sirf DB se path remove (file delete optional hai)
    user.profileImage = "";
    await user.save();

    res.json({ message: "Profile image removed" });
  } catch (err) {
    console.error("DELETE AVATAR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------- CHANGE PASSWORD ---------------- */
router.put("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // demo project → plain text check
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------- GET ALL DEVELOPERS ---------------- */
router.get("/", async (req, res) => {
  const users = await User.find({ role: "developer" }).populate("team");
  res.json(users);
});

module.exports = router;
