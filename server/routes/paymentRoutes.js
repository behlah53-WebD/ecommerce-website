const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const { User } = require("../models/User");
const orderModule = require("../models/Order");
const { Detail } = require("../models/Detail");
const { authenticateToken } = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");
const { generateInvoicePdf, generateInvoiceHtml } = require("../utils/invoiceGenerator");

const Order = orderModule.Order || orderModule.default || orderModule;

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID) {
  console.error("Missing RAZORPAY_KEY_ID in servers/.env");
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

    // ⚠️  Do NOT save the order to the database here.
    // The order will only be created in the DB after payment is verified.
    // Pass all order data back to the client so it can be forwarded
    // to /verify-payment on success.

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully.",
      data: {
        orderId: appOrderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        // Forward the order payload so the client can send it to verify-payment
        orderPayload: {
          items,
          shippingAddress,
          subtotal,
          shipping,
          tax,
          grandTotal,
        },
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
      // Full order payload forwarded from the frontend
      orderPayload,
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

    // Verify the Razorpay payment signature FIRST
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Signature mismatch → payment invalid, do NOT create the order
      return res.status(400).json({
        success: false,
        message:
          "Payment signature verification failed. Order was not created.",
      });
    }

    // Payment is genuine — now create the order in the database
    const { items, shippingAddress, subtotal, shipping, tax, grandTotal } =
      orderPayload || {};

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Order payload is missing. Cannot create order.",
      });
    }

    const order = await Order.create({
      orderId,
      userId: storedUserId,
      items,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      grandTotal,
      status: "Pending",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "Paid",
      paymentVerifiedAt: new Date(),
      stockDecremented: true,
    });

    // Decrease stock for each product in the order on successful payment
    for (const item of order.items) {
      const productId = item.productId;
      const quantity = item.quantity || 1;

      const product = await Detail.findOne({ id: productId });
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - quantity);
        product.stock = newStock;

        if (newStock === 0) {
          product.productStatus = "Out of Stock";
        } else if (newStock <= 10) {
          product.productStatus = "Low Stock";
        } else {
          product.productStatus = "In Stock";
        }
        await product.save();
      }
    }

    // Clear the cart after payment success
    user.cart = [];
    await user.save();

    // Generate and send invoice PDF asynchronously so we don't delay the response
    if (order.shippingAddress?.email) {
      generateInvoicePdf(order)
        .then((pdfBuffer) => {
          return sendEmail({
            to: order.shippingAddress.email,
            subject: `Invoice for Order #${order.orderId}`,
            text: `Thank you for your order! Please find attached the invoice PDF for your order #${order.orderId}.`,
            html: generateInvoiceHtml(order),
            attachments: [
              {
                filename: `invoice_${order.orderId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });
        })
        .then(() => {
          console.log(
            `[Invoice] Sent successfully to ${order.shippingAddress.email}`,
          );
        })
        .catch((err) => {
          console.error(
            "[Invoice] Failed to generate or send invoice email:",
            err,
          );
        });
    } else {
      console.warn(
        `[Invoice] No shipping email found for order ${order.orderId}, skipping email.`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order created successfully.",
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
