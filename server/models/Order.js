const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: 'Product' },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    color: { type: String, default: null },
    size: { type: String, default: null },
    quantity: { type: Number, default: 1 },
    sellerId: { type: String, default: null },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
      default: 'Processing',
    },
    paymentMethod: { type: String, default: 'Card' },
    returnRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      processedAt: { type: Date },
      processedBy: { type: String },
    },
    cancelRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      processedAt: { type: Date },
      processedBy: { type: String },
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;
