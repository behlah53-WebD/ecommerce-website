require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Body parsers
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// CORS configuration
const allowedOrigins = [
  "https://ecommerce-website-c2tr.vercel.app",
  "https://ecommerce-website-ten-beryl.vercel.app",
  "http://localhost:5173", // local dev (Vite default)
  "http://localhost:5174", // local dev (CRA/other)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true, // if you ever use cookies / auth headers
  }),
);

// Routes
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
      maxPoolSize: 10, // allow up to 10 concurrent connections
      serverSelectionTimeoutMS: 8000, // fail fast if Atlas unreachable
      socketTimeoutMS: 45000, // how long to wait for a response
      connectTimeoutMS: 10000, // initial connection timeout
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
