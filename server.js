const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

let isConnected = false;

// MongoDB Connection
async function connectToMongoDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "your_database_name", // Agar URI me database name hai to is line ko hata do
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}
connectToMongoDB();
// Connect before every request
app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectToMongoDB();
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Backend Running..." });
});

// EXPORT APP FOR VERCEL
module.exports = app;