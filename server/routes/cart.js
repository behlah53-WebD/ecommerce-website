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
    return res.json({ success: true, items: user.cart || [] });
  } catch (error) {
    console.error("[GET /cart]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});



router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, image, color, size, quantity } = req.body;

    const rawId = productId || req.body.id || req.body._id;
    if (!rawId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const user = await User.findOne(getUserFilter(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pId = String(rawId);
    const qtyToAdd  = Math.max(1, Number(quantity) || 1);
    const itemColor = color  != null ? (color  || null) : null;
    const itemSize  = size   != null ? (size   || null) : null;

    
    const updated = await User.findOneAndUpdate(
      { _id: user._id, cart: { $elemMatch: { productId: pId, color: itemColor, size: itemSize } } },
      { $inc: { "cart.$.quantity": qtyToAdd } },
      { returnDocument: 'after', runValidators: false }
    );

    if (updated) {
      console.log(`[POST /cart] Incremented qty for ${pId} — user ${user.id}`);
      return res.json({ success: true, message: "Cart item quantity updated", items: updated.cart || [] });
    }

    
    const newItem = {
      productId: pId,
      name:     String(name  || "Product"),
      price:    Number(price) || 0,
      image:    String(image || ""),
      color:    itemColor,
      size:     itemSize,
      quantity: qtyToAdd,
    };

    const pushed = await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { cart: newItem } },
      { returnDocument: 'after', runValidators: false }
    );

    console.log(`[POST /cart] Added ${pId} to cart — user ${user.id}`);
    return res.json({ success: true, message: "Item added to cart", items: pushed ? (pushed.cart || []) : [] });
  } catch (error) {
    console.error("[POST /cart]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/item", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, color, size, delta, quantity } = req.body;

    const rawId = productId || req.body.id || req.body._id;
    if (!rawId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const user = await User.findOne(getUserFilter(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pId = String(rawId);
    const itemColor = color != null ? (color || null) : null;
    const itemSize  = size  != null ? (size  || null) : null;

    const currentItem = (user.cart || []).find(
      (m) => String(m.productId) === pId && m.color === itemColor && m.size === itemSize
    );

    if (!currentItem) {
      return res.json({ success: true, items: user.cart || [] });
    }

    let newQty;
    if (quantity !== undefined) {
      newQty = Number(quantity);
    } else if (delta !== undefined) {
      newQty = currentItem.quantity + Number(delta);
    } else {
      return res.json({ success: true, items: user.cart || [] });
    }

    let result;
    if (newQty <= 0) {
      result = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { cart: { productId: pId, color: itemColor, size: itemSize } } },
        { returnDocument: 'after', runValidators: false }
      );
    } else {
      result = await User.findOneAndUpdate(
        { _id: user._id, cart: { $elemMatch: { productId: pId, color: itemColor, size: itemSize } } },
        { $set: { "cart.$.quantity": newQty } },
        { returnDocument: 'after', runValidators: false }
      );
    }

    return res.json({ success: true, items: result ? (result.cart || []) : [] });
  } catch (error) {
    console.error("[PUT /cart/item]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/item", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, color, size } = req.body;

    const rawId = productId || req.body.id || req.body._id;
    if (!rawId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const user = await User.findOne(getUserFilter(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pId = String(rawId);
    const itemColor = color != null ? (color || null) : null;
    const itemSize  = size  != null ? (size  || null) : null;

    const result = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { cart: { productId: pId, color: itemColor, size: itemSize } } },
      { returnDocument: 'after', runValidators: false }
    );

    return res.json({ success: true, items: result ? (result.cart || []) : [] });
  } catch (error) {
    console.error("[DELETE /cart/item]", error);
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

    const merged = [...(user.cart || [])];

    for (const newItem of items) {
      const rawId = newItem.productId || newItem.id || newItem._id;
      if (!rawId) continue;
      const pId = String(rawId);
      const c   = newItem.color != null ? (newItem.color || null) : null;
      const s   = newItem.size  != null ? (newItem.size  || null) : null;

      const idx = merged.findIndex(
        (m) => String(m.productId) === pId && m.color === c && m.size === s
      );

      if (idx > -1) {
        merged[idx] = {
          ...merged[idx],
          quantity: Math.max(merged[idx].quantity, Number(newItem.quantity) || 1),
        };
      } else {
        merged.push({
          productId: pId,
          name:      String(newItem.name || "Product"),
          price:     Number(newItem.price) || 0,
          image:     String(newItem.image || ""),
          color:     c,
          size:      s,
          quantity:  Number(newItem.quantity) || 1,
        });
      }
    }

    const result = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { cart: merged } },
      { returnDocument: 'after', runValidators: false }
    );

    return res.json({ success: true, items: result ? (result.cart || []) : [] });
  } catch (error) {
    console.error("[POST /cart/sync]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne(getUserFilter(userId));
    if (user) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { cart: [] } },
        { runValidators: false }
      );
    }
    return res.json({ success: true, items: [] });
  } catch (error) {
    console.error("[DELETE /cart/clear]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
