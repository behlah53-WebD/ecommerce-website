const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fieldname: String,
  filename: String,
  encoding: String,
  mimetype: String,
  size: Number,
  data: String,
});

const detailsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    files: [fileSchema],
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: "Product" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    color: { type: String, default: null },
    size: { type: String, default: null },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    brand: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    authEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    authPassword: { type: String, required: true },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["Admin", "Seller", "Buyer"],
      default: "Buyer",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    details: { type: [detailsSchema], default: [] },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { User, userSchema, detailsSchema, fileSchema, cartItemSchema, wishlistItemSchema };
