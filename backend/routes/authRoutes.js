const express = require("express");
const User = require("../models/User");
const {
  normalizeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require("../utils/email");

const router = express.Router();
const crypto = require("crypto");

router.post("/login", async (req, res) => {
  try {
    const emailNorm = normalizeEmail(req.body?.email);
    const { password } = req.body || {};
    console.log("LOGIN BODY:", { email: emailNorm, hasPassword: password != null });

    if (!emailNorm || password == null) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: emailNorm }).collation({
      locale: "en",
      strength: 2,
    }).populate("team");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // TEMP SIMPLE PASSWORD CHECK (testing)
    if (String(password) !== String(user.password)) {
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
  try {
    const emailNorm = normalizeEmail(req.body?.email);
    if (!emailNorm) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: emailNorm }).collation({
      locale: "en",
      strength: 2,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendBaseUrl.replace(/\/$/, "")}/reset-password/${token}`;

    res.json({
      message: "Password reset email sent",
      resetLink,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to send password reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
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
    let emailSent = false;
    let emailError = "";
    try {
      await sendPasswordChangedEmail({
        to: user.email,
        name: user.name,
      });
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message || "Failed to send password changed email";
      console.error("PASSWORD CHANGED EMAIL ERROR:", emailError);
    }

    res.json({
      message: "Password updated successfully",
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to reset password" });
  }
});


module.exports = router;
