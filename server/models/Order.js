const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Product",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    sellerId: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Returned",
      ],
      default: "Pending",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

     paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    stockDecremented: {
      type: Boolean,
      default: false,
    },

    returnRequest: {
      requested: {
        type: Boolean,
        default: false,
      },
      requestedAt: Date,
      reason: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      processedAt: Date,
      processedBy: String,
    },

    cancelRequest: {
      requested: {
        type: Boolean,
        default: false,
      },
      requestedAt: Date,
      reason: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      processedAt: Date,
      processedBy: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
