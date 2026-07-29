const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: {
      type: [
        {
          productId: { type: String, required: true },
          name: { type: String, default: "" },
          price: { type: Number, default: 0 },
          image: { type: String, default: "" },
          category: { type: String, default: "" },
          brand: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

module.exports = { Wishlist };
