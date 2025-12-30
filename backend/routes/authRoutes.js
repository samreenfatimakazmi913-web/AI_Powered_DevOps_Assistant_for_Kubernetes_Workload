const express = require("express");
const User = require("../models/User");

const router = express.Router();

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
        team: user.team || null
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
