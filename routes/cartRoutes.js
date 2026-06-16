const express = require("express");
const Cart = require("../models/Cart");

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { userId, productId } =
      req.body;

    let item = await Cart.findOne({
      userId,
      productId,
    });

    if (item) {
      item.quantity += 1;
      await item.save();
    } else {
      item = await Cart.create({
        userId,
        productId,
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:userId", async (req, res) => {
  const items = await Cart.find({
    userId: req.params.userId,
  }).populate("productId");

  res.json(items);
});

module.exports = router;