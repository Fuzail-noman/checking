const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  OAuth2Client,
} = require("google-auth-library");

const router = express.Router();

const client =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );

// ================= SIGNUP =================
router.post(
  "/signup",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const userExist =
        await User.findOne({
          email,
        });

      if (userExist) {
        return res.json({
          success: false,
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      await User.create({
        name,
        email,
        password:
          hashedPassword,
      });

      res.json({
        success: true,
        message:
          "Signup successful",
      });
    } catch (err) {
      res.json({
        success: false,
        message:
          err.message,
      });
    }
  }
);

// ================= LOGIN =================
router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.json({
          success: false,
          message:
            "User not found",
        });
      }

      if (
        !user.password
      ) {
        return res.json({
          success: false,
          message:
            "Please login with Google",
        });
      }

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {
        return res.json({
          success: false,
          message:
            "Wrong password",
        });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
          },
          process.env
            .JWT_SECRET,
          {
            expiresIn:
              "7d",
          }
        );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email:
            user.email,
        },
      });
    } catch (err) {
      res.json({
        success: false,
        message:
          err.message,
      });
    }
  }
);

// ================= GOOGLE LOGIN =================
router.post(
  "/google",
  async (req, res) => {
    try {
      const {
        credential,
      } = req.body;

      const ticket =
        await client.verifyIdToken(
          {
            idToken:
              credential,
            audience:
              process.env
                .GOOGLE_CLIENT_ID,
          }
        );

      const payload =
        ticket.getPayload();

      const {
        sub,
        email,
        name,
      } = payload;

      let user =
        await User.findOne({
          email,
        });

      if (!user) {
        user =
          await User.create({
            name,
            email,
            googleId:
              sub,
          });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
          },
          process.env
            .JWT_SECRET,
          {
            expiresIn:
              "7d",
          }
        );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email:
            user.email,
        },
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message:
          "Google Login Failed",
      });
    }
  }
);

// ================= FORGOT PASSWORD =================
router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const {
        email,
        newPassword,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.json({
          success: false,
          message:
            "User not found",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      res.json({
        success: true,
        message:
          "Password changed successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message:
          err.message,
      });
    }
  }
);

// ================= LOGOUT =================
router.post(
  "/logout",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Logged out successfully",
    });
  }
);

module.exports = router;