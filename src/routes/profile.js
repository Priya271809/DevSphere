const express = require("express");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const { generateEmbedding } = require("../services/aiService");
const User = require("../models/user");

/* ================= VIEW CURRENT USER PROFILE ================= */
profileRouter.get("/profile/view", userAuth, async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= EDIT USER PROFILE ================= */
profileRouter.patch("/profile/edit", userAuth, async (req, res, next) => {
  try {
    if (!validateEditProfileData(req)) {
      return res.status(400).json({ error: "Invalid profile update fields provided." });
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    // CRITICAL FIX: Persist changes to the database
    const updatedUser = await loggedInUser.save();

    // Background AI Embedding generation (non-blocking)
    const embeddingText = `${updatedUser.headline || ""} ${(updatedUser.skills || []).join(" ")} ${updatedUser.about || ""} ${updatedUser.lookingFor || ""}`.trim();
    if (embeddingText) {
      generateEmbedding(embeddingText)
        .then((vector) => {
          if (vector && vector.length > 0) {
            User.findByIdAndUpdate(updatedUser._id, { embedding: vector }).exec();
          }
        })
        .catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `${updatedUser.firstName}, your profile was updated successfully!`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= CHANGE PASSWORD ================= */
profileRouter.patch("/profile/password", userAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please provide both current and new password." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const isMatch = await req.user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = profileRouter;
