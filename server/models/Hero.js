const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema(
  {
    subtitle: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    buttonText1: { type: String, default: "" },
    buttonLink1: { type: String, default: "" },
    buttonText2: { type: String, default: "" },
    buttonLink2: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Hero = mongoose.models.Hero || mongoose.model("Hero", heroSchema);

module.exports = { Hero };
