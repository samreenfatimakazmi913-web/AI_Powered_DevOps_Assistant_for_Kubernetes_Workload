const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Team = require("../models/Team");
const { normalizeEmail, sendDeveloperWelcomeEmail } = require("../utils/email");


const router = express.Router();

/* ---------------- CREATE USER (ADMIN) ---------------- */
router.post("/", async (req, res) => {
  try {
    const { name, password, role, teamId } = req.body;
    const emailNorm = normalizeEmail(req.body?.email);

    if (!name || !emailNorm || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await User.findOne({ email: emailNorm }).collation({
      locale: "en",
      strength: 2,
    });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    let team = null;
    if (teamId && mongoose.Types.ObjectId.isValid(teamId)) {
      team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: "Invalid team" });
      }
    }

    const user = await User.create({
      name,
      email: emailNorm,
      password,   // demo project → plain text OK
      role,
      team: team ? team._id : null,
    });

    const createdUser = await User.findById(user._id).populate("team");

    let emailSent = false;
    let emailError = "";
    try {
      await sendDeveloperWelcomeEmail({
        to: emailNorm,
        name,
        password,
        teamName: team?.name || "",
        namespaces: Array.isArray(team?.namespaces) ? team.namespaces : [],
        legacyNamespace: team?.namespace || "",
      });
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message || "Failed to send welcome email";
      console.error("WELCOME EMAIL ERROR:", emailError);
    }

    res.status(201).json({
      ...(createdUser ? createdUser.toObject() : user.toObject()),
      emailSent,
      emailError,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "User already exists" });
    }
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ error: err.message || "Server error" });
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

/* ---------------- GET SINGLE DEVELOPER ---------------- */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("team");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/* ---------------- UPDATE USER (ADMIN) ---------------- */
router.put("/:id", async (req, res) => {
  try {
    const { name, email, teamId } = req.body;

    const update = {};
    if (name) update.name = name;
    if (email) update.email = normalizeEmail(email);
    if (teamId !== undefined) {
      if (teamId === "" || teamId === null) {
        update.team = null;
      } else if (mongoose.Types.ObjectId.isValid(teamId)) {
        const team = await Team.findById(teamId);
        if (!team) return res.status(400).json({ error: "Invalid team" });
        update.team = team._id;
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("team");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/* ---------------- DELETE USER (ADMIN) ---------------- */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Developer deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
