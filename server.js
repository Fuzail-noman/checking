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


let isConnected = false;

async function connectToMongoDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}


 connectToMongoDB();

// app.use((req , res ,next ) =>{
//   if(!isConnected){
//     connectToMongoDB();

//   }
//   next()
// })
console.log(process.env.MONGO_URI);
// EXPORT APP FOR VERCEL
module.exports = app;