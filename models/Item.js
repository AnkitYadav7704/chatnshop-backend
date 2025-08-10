const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional: If you want to link it to a user
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
