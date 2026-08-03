const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const { User } = require("../models/User");
const orderModule = require("../models/Order");
const { authenticateToken } = require("../middleware/auth");

const Order = orderModule.Order || orderModule.default || orderModule;

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID) {
  console.error("Missing RAZORPAY_KEY_ID in server/.env");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error("Missing RAZORPAY_KEY_SECRET in server/.env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?._id;
};

const findUserByAuthId = async (authUserId) => {
  return User.findOne({
    id: String(authUserId),
  });
};

const getStoredUserId = (user) => {
  return String(user.id);
};

const calculateShipping = (subtotal) => {
  return subtotal > 100 ? 0 : 15;
};

const normalizeCartItem = (item) => {
  return {
    productId: String(item.productId || item.id || item._id || ""),
    name: item.name || item.productName || "Product",
    price: Number(item.price) || 0,
    image: item.image || item.images?.[0] || "",
    color: item.color || null,
    size: item.size || null,
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
};

router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    const authUserId = getUserId(req);
    const { shippingAddress } = req.body;

    console.log("Decoded auth user:", req.user);
    console.log("Auth user ID:", authUserId);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "User ID is missing from access token.",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are missing in server/.env.",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.email ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required.",
      });
    }

    const user = await findUserByAuthId(authUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for the authenticated user ID.",
      });
    }

    const rawCartItems = Array.isArray(user.cart) ? user.cart : [];

    if (rawCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const items = rawCartItems
      .map(normalizeCartItem)
      .filter((item) => item.productId && item.quantity > 0);

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart contains no valid items.",
      });
    }

    const subtotal = Number(
      items
        .reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0)
        .toFixed(2),
    );

    const shipping = calculateShipping(subtotal);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const grandTotal = Number((subtotal + shipping + tax).toFixed(2));

    // INR amount must be sent in paise.
    const amount = Math.round(grandTotal * 100);

    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
        debug: {
          subtotal,
          shipping,
          tax,
          grandTotal,
          amount,
        },
      });
    }

    const appOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const storedUserId = getStoredUserId(user);

    console.log("Creating Razorpay order:", {
      appOrderId,
      storedUserId,
      subtotal,
      shipping,
      tax,
      grandTotal,
      amount,
      currency: "INR",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        appOrderId,
        userId: storedUserId,
      },
    });

    const newOrder = await Order.create({
      orderId: appOrderId,
      userId: storedUserId,
      items,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      grandTotal,
      status: "Processing",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
    });

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully.",
      data: {
        orderId: newOrder.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", {
      message: error.message,
      description: error.error?.description,
      code: error.error?.code,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Failed to create payment order.",
    });
  }
});

router.post("/verify-payment", authenticateToken, async (req, res) => {
  try {
    const authUserId = getUserId(req);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "User ID is missing from access token.",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification data.",
      });
    }

    const user = await findUserByAuthId(authUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const storedUserId = getStoredUserId(user);

    const order = await Order.findOne({
      orderId,
      userId: storedUserId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "Paid";
    order.paymentVerifiedAt = new Date();
    order.status = "Processing";

    await order.save();

    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment.",
    });
  }
});

module.exports = router;
