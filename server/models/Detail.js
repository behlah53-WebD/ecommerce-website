const mongoose = require("mongoose");
const { fileSchema } = require("./User");

const detailSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true },
    sellerName: { type: String, default: "" },
    sellerEmail: { type: String, default: "" },
    // Product details
    productName: { type: String, default: "" },
    sku: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    brand: { type: String, default: "" },
    description: { type: String, default: "" },
    productStatus: { type: String, default: "In Stock" },
    
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    files: [fileSchema],
    status: {
      type: String,
      enum: ["approved", "pending_add", "pending_edit", "pending_delete", "rejected"],
      default: "approved",
    },
    pendingChanges: { type: Object, default: null },
  },
  { timestamps: true }
);

const Detail = mongoose.models.Detail || mongoose.model("Detail", detailSchema);

module.exports = {detailSchema, Detail}  ;
