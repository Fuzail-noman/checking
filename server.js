const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Backend Running..." });
});

// MongoDB Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lumora"
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("DB Error:", err);
  }
};

// Connect DB once
connectDB();



// EXPORT APP FOR VERCEL
module.exports = app;