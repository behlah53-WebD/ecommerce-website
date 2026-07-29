require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const { swaggerDocs, swaggerUi } = require("./config/swagger");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const emailRoutes = require("./routes/email");
const orderRoutes = require("./routes/orders");
const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/user";

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-user-id",
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/email", emailRoutes);
app.use("/orders", orderRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB successfully at ${MONGO_URI}`);
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`),
    );
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

module.exports = app;