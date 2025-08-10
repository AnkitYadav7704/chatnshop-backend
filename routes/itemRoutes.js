const express = require("express");
const multer = require("multer");
const Item = require("../models/Item");
const protectRoute = require("../middleware/authMiddleware");

const router = express.Router();

// 🔸 Multer setup to store uploaded images in "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

/**
 * 📤 Route: POST /api/items/add
 * 🔐 Protected: Yes (requires token)
 * 📎 Use: Upload an item with image
 */
router.post("/add", protectRoute, upload.single("image"), async (req, res) => {
  try {
    if (!req.body || !req.file) {
      return res.status(400).json({ message: "Missing data or image" });
    }

    const { name, price, category } = req.body;
    const postedBy = req.user;
    const imageUrl = req.file.filename;

    const item = new Item({ name, price, category, imageUrl, postedBy });
    await item.save();

    res.json({ message: "✅ Item listed successfully", item });
  } catch (err) {
    console.error("❌ Item upload failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 📦 Route: GET /api/items/all
 * 🔐 Public
 * 📎 Use: Get all items (everyone's)
 */
router.get("/all", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ Failed to fetch items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 👤 Route: GET /api/items/my
 * 🔐 Protected
 * 📎 Use: Get only logged-in user's items
 */
router.get("/my", protectRoute, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user });
    res.json(items);
  } catch (err) {
    console.error("❌ Failed to fetch user's items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
