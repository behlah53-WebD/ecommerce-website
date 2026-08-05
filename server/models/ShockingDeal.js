const mongoose = require("mongoose");

const shockingDealSchema = new mongoose.Schema(
  {
    title: { type: String, default: "SHOCKING DEAL" },
    subtitle: { type: String, default: "The opportunity will quickly pass. Take it!" },
    endTime: { type: Date, required: true },
    products: [
      {
        productId: { type: String, required: true },
        discountPercentage: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ShockingDeal = mongoose.models.ShockingDeal || mongoose.model("ShockingDeal", shockingDealSchema);

module.exports = { ShockingDeal };
