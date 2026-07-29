const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const getUserFilter = (userId) => {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return { $or: [{ id: String(userId) }, { _id: userId }] };
  }
  return { id: String(userId) };
};


router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne(getUserFilter(userId)).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, items: user.wishlist || [] });
  } catch (error) {
    console.error("[GET /wishlist]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});



router.post("/toggle", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, image, category, brand } = req.body;

    const rawId = productId || req.body.id || req.body._id;
    if (!rawId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const user = await User.findOne(getUserFilter(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pId = String(rawId);
    const existingIndex = (user.wishlist || []).findIndex(
      (item) => String(item.productId) === pId
    );

    let result;
    let action;

    if (existingIndex > -1) {
      
      result = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { wishlist: { productId: pId } } },
        { returnDocument: 'after', runValidators: false }
      );
      action = "removed";
    } else {
      
      result = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            wishlist: {
              productId: pId,
              name:      String(name     || "Product"),
              price:     Number(price)   || 0,
              image:     String(image    || ""),
              category:  String(category || ""),
              brand:     String(brand    || ""),
            },
          },
        },
        { returnDocument: 'after', runValidators: false }
      );
      action = "added";
    }

    console.log(`[POST /wishlist/toggle] ${action} ${pId} — user ${user.id}`);
    return res.json({ success: true, action, items: result ? (result.wishlist || []) : [] });
  } catch (error) {
    console.error("[POST /wishlist/toggle]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});



router.post("/sync", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items must be an array" });
    }

    const user = await User.findOne(getUserFilter(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const merged = [...(user.wishlist || [])];

    for (const newItem of items) {
      const rawId = newItem.productId || newItem.id || newItem._id;
      if (!rawId) continue;
      const pId = String(rawId);

      const idx = merged.findIndex((m) => String(m.productId) === pId);
      if (idx === -1) {
        merged.push({
          productId: pId,
          name:      String(newItem.name     || "Product"),
          price:     Number(newItem.price)   || 0,
          image:     String(newItem.image    || ""),
          category:  String(newItem.category || ""),
          brand:     String(newItem.brand    || ""),
        });
      }
    }

    const result = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { wishlist: merged } },
      { returnDocument: 'after', runValidators: false }
    );

    return res.json({ success: true, items: result ? (result.wishlist || []) : [] });
  } catch (error) {
    console.error("[POST /wishlist/sync]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
