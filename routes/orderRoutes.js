const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const nodemailer = require("nodemailer");

router.post("/create", async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      area,
      items,
      subtotal,
      delivery,
      total,
      method,
    } = req.body;

    const order = await Order.create({
      name,
      phone,
      city,
      area,
      items,
      subtotal,
      delivery,
      total,
      method,
    });

    const orderItems = items
      .map(
        (item, index) =>
          `${index + 1}.
Name: ${item.name}
Price: Rs ${item.price}
Quantity: ${item.quantity}
Subtotal: Rs ${item.price * item.quantity}`
      )
      .join("\n\n");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🛍 New Order Received - Lumora",
      text: `
NEW ORDER RECEIVED

Name: ${name}
Phone: ${phone}
City: ${city}
Area: ${area}

ORDER ITEMS:

${orderItems}

Subtotal: Rs ${subtotal}
Delivery: Rs ${delivery}
Total: Rs ${total}
`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;