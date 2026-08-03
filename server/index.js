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
const paymentRoutes = require("./routes/paymentRoutes");
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Body parsers – BEFORE routes
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// CORS configuration – MUST be before routes
const configuredOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  // Frontend on Vercel
  "https://shopzyra.vercel.app",
  "https://zyra-admin-page.vercel.app",

  // Local dev
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  ...configuredOrigins,
];

const isAllowedVercelOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use((req, res, next) => {
  console.log(
    "CORS check:",
    req.method,
    req.path,
    "origin =",
    req.headers.origin,
  );
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
    
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        isAllowedVercelOrigin(origin)
      ) {
        console.log("CORS allowed for origin:", origin);
        callback(null, true);
      } else {
        console.log("CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  }),
);

// Simple test route to verify CORS
app.get("/health", (req, res) => {
  res.json({ status: "ok", origin: req.headers.origin });
});

// Routes – AFTER CORS
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/email", emailRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);

// Global error handler (after routes)
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
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
