const express = require("express");
const User = require("../models/User");

const router = express.Router();
const crypto = require("crypto");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // TEMP SIMPLE PASSWORD CHECK (testing)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // TEMP TOKEN (dummy)
    const token = "dummy-token";

    console.log("LOGIN SUCCESS USER:", user.email);

    return res.json({
  token,
  user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  team: user.team,
  profileImage: user.profileImage || ""
}
});


  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // token generate
  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save();

  // FYP ke liye: email send nahi, sirf link return
  const resetLink = `http://localhost:3000/reset-password/${token}`;

  res.json({
    message: "Reset link generated",
    resetLink,
  });
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: "Password updated successfully" });
});


module.exports = router;
