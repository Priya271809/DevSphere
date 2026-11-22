const express = require("express");
const aiRouter = express.Router();
const rateLimit = require("express-rate-limit");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const {
  getMatchExplanation,
  generateProfileFromGitHub,
  getIcebreakers,
} = require("../services/aiService");

// Rate limit AI actions to 25 requests per 10 minutes per IP/user
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  message: { error: "AI rate limit reached. Please wait a few moments before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= 1. GENERATE PROFILE FROM GITHUB ================= */
aiRouter.post("/ai/github-profile", userAuth, aiLimiter, async (req, res, next) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername || typeof githubUsername !== "string") {
      return res.status(400).json({ error: "Please provide a valid GitHub username." });
    }

    const aiGeneratedData = await generateProfileFromGitHub(githubUsername.trim());

    return res.status(200).json({
      success: true,
      message: "Profile suggestions generated from GitHub successfully!",
      data: aiGeneratedData,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= 2. WHY YOU MATCHED EXPLANATION ================= */
aiRouter.get("/ai/why-matched/:targetUserId", userAuth, aiLimiter, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;

    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName headline skills lookingFor about"
    );

    if (!targetUser) {
      return res.status(404).json({ error: "Target developer not found." });
    }

    const explanation = await getMatchExplanation(loggedInUser, targetUser);

    return res.status(200).json({
      success: true,
      data: { explanation },
    });
  } catch (err) {
    next(err);
  }
});

/* ================= 3. AI ICEBREAKERS ================= */
aiRouter.get("/ai/icebreakers/:targetUserId", userAuth, aiLimiter, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;

    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName headline skills lookingFor"
    );

    if (!targetUser) {
      return res.status(404).json({ error: "Target developer not found." });
    }

    const icebreakers = await getIcebreakers(loggedInUser, targetUser);

    return res.status(200).json({
      success: true,
      data: { icebreakers },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = aiRouter;
