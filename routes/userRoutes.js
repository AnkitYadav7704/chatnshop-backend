const express = require("express");

const User = require("../models/User");
const protectRoute = require("../middleware/authMiddleware");
const router = express.Router();
// 📘 GET /api/users/me - Get current user profile
router.get("/me", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password"); // hide password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
