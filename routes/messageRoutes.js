const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const protectRoute = require("../middleware/authMiddleware");

// Send message
router.post("/send", protectRoute, async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Missing receiver or content" });
  }

  try {
    const message = await Message.create({
      sender: req.user,
      receiver: receiverId,
      content,
    });

    res.json({ message: "📨 Message sent", data: message });
  } catch (err) {
    console.error("❌ Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🗃️ Fetch chat history with a user
router.get("/:userId", protectRoute, async (req, res) => {
  const currentUserId = req.user;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ timestamp: 1 }); // oldest to newest

    res.json({ messages });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get messages with a specific user
router.get("/:userId", protectRoute, async (req, res) => {
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
