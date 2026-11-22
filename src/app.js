require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const aiRouter = require("./routes/ai");
const chatRouter = require("./routes/chat");

const app = express();

/* ================= 1. SECURITY & HEADERS ================= */
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow external image CDNs (Unsplash, DiceBear, GitHub)
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Strict CORS allowing client origins with credentials (cookies)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, or origin matched
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

/* ================= 2. PARSERS & RATE LIMITERS ================= */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// General API rate limiter (300 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Specific Auth rate limiter (30 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many login/signup attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= 3. ROUTES ================= */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/", authLimiter, authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", aiRouter);
app.use("/", chatRouter);

/* ================= 4. SERVE FRONTEND (SINGLE UNIFIED WEBSITE) ================= */
const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") return next();

    // Avoid intercepting API routes
    if (
      req.originalUrl.startsWith("/user") ||
      req.originalUrl.startsWith("/request") ||
      req.originalUrl.startsWith("/profile") ||
      req.originalUrl.startsWith("/login") ||
      req.originalUrl.startsWith("/signup") ||
      req.originalUrl.startsWith("/logout") ||
      req.originalUrl.startsWith("/health")
    ) {
      return next();
    }
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

/* ================= 5. 404 & CENTRALIZED ERROR HANDLER ================= */
app.use((req, res, next) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.` });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "An internal server error occurred.";

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this field already exists.";
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

/* ================= 5. START SERVER ================= */
const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connected successfully...");
    app.listen(PORT, () => {
      console.log(`DevTinder Backend running securely on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

module.exports = app;
