const express = require("express");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");

const authRouter = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/* ================= USER SIGNUP ================= */
authRouter.post("/signup", async (req, res, next) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, skills, headline, about, photoUrl } = req.body;
    const normalizedEmail = emailId.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ emailId: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email address already exists." });
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : "",
      emailId: normalizedEmail,
      password: passwordHash,
      skills: Array.isArray(skills) && skills.length > 0 ? skills : ["JavaScript", "React", "Node.js"],
      headline: headline || "Full Stack Developer",
      about: about || "Excited to connect with developers, build cool projects, and share knowledge.",
      photoUrl: photoUrl || undefined,
    });

    const savedUser = await newUser.save();
    const token = savedUser.getJWT();

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: savedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
});

/* ================= USER LOGIN ================= */
authRouter.post("/login", async (req, res, next) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const normalizedEmail = emailId.trim().toLowerCase();
    const user = await User.findOne({ emailId: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = user.getJWT();
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
});

/* ================= USER LOGOUT ================= */
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful! Session ended.",
  });
});

module.exports = authRouter;
