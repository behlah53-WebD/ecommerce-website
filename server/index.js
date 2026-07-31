require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);


const express = require("express");
const mongoose = require("mongoose");
const { swaggerDocs, swaggerUi } = require("./config/swagger");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const emailRoutes = require("./routes/email");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-user-id"
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

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,          // allow up to 10 concurrent connections
      serverSelectionTimeoutMS: 8000,  // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,   // how long to wait for a response
      connectTimeoutMS: 10000,  // initial connection timeout
    });
    console.log("Connected to MongoDB successfully");

    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;