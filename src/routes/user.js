const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { cosineSimilarity } = require("../services/aiService");

const USER_SAFE_FIELDS =
  "firstName lastName photoUrl headline age gender about skills githubUrl linkedinUrl location lookingFor createdAt";

/* ================= GET RECEIVED PENDING REQUESTS ================= */
userRouter.get("/user/requests/received", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .sort({ createdAt: -1 });

    const safeRequests = pendingRequests.filter((req) => req.fromUserId);

    return res.status(200).json({
      success: true,
      count: safeRequests.length,
      data: safeRequests,
    });
  } catch (err) {
    next(err);
  }
});

// Backward compatibility alias for /user/requests
userRouter.get("/user/requests", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .sort({ createdAt: -1 });

    const safeRequests = pendingRequests.filter((req) => req.fromUserId);

    return res.status(200).json({
      success: true,
      count: safeRequests.length,
      data: safeRequests,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= GET ACCEPTED CONNECTIONS ================= */
userRouter.get("/user/connections", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS)
      .sort({ updatedAt: -1 });

    // Format output so it returns the counterpart user plus the connection metadata
    const connectedUsers = connections
      .filter((conn) => conn.fromUserId && conn.toUserId)
      .map((conn) => {
        const isFromMe = conn.fromUserId._id.toString() === loggedInUser._id.toString();
        const counterpart = isFromMe ? conn.toUserId : conn.fromUserId;
        if (!counterpart) return null;
        return {
          connectionId: conn._id,
          connectedAt: conn.updatedAt,
          ...(counterpart.toObject ? counterpart.toObject() : counterpart),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: connectedUsers.length,
      data: connectedUsers,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= GET FEED (RECOMMENDED PROFILES) ================= */
userRouter.get("/user/feed", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 12;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 12;

    const skip = (page - 1) * limit;

    // 1. Find all connection requests involving the logged-in user (sent OR received)
    const allUserRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // 2. Build set of user IDs to hide from feed
    const hiddenUserIds = new Set();
    hiddenUserIds.add(loggedInUser._id.toString()); // Hide self

    allUserRequests.forEach((reqItem) => {
      hiddenUserIds.add(reqItem.fromUserId.toString());
      hiddenUserIds.add(reqItem.toUserId.toString());
    });

    const filterQuery = {
      _id: { $nin: Array.from(hiddenUserIds) },
    };

    // Tech stack filter support if query parameter passed
    if (req.query.skill) {
      filterQuery.skills = { $regex: new RegExp(req.query.skill, "i") };
    }

    // 3. Fetch candidate developers with pagination
    const total = await User.countDocuments(filterQuery);

    const candidates = await User.find(filterQuery)
      .select(USER_SAFE_FIELDS + " embedding")
      .skip(skip)
      .limit(limit)
      .lean();

    // 4. Calculate skill alignment & blended AI semantic match score
    const mySkills = new Set(
      (loggedInUser.skills || []).filter(Boolean).map((s) => s.toLowerCase().trim())
    );

    const candidatesWithMatchScore = candidates.map((candidate) => {
      const candidateSkills = (candidate.skills || [])
        .filter(Boolean)
        .map((s) => s.toLowerCase().trim());
      const commonSkills = candidateSkills.filter((s) => mySkills.has(s));

      const overlap = commonSkills.length;
      const totalDistinct = new Set([...mySkills, ...candidateSkills]).size;
      const jaccard = totalDistinct > 0 ? overlap / totalDistinct : 0;
      const techScore = jaccard * 100;

      let semanticScore = 0;
      if (loggedInUser.embedding?.length && candidate.embedding?.length) {
        const sim = cosineSimilarity(loggedInUser.embedding, candidate.embedding);
        semanticScore = Math.max(0, sim * 100);
      }

      let matchPercentage = 60;
      if (semanticScore > 0) {
        // Blend: 50% AI semantic similarity + 50% tech stack overlap
        matchPercentage = Math.round(52 + (0.5 * semanticScore + 0.5 * techScore) * 0.45);
      } else if (totalDistinct > 0) {
        matchPercentage = Math.round(55 + jaccard * 40);
      }
      if (matchPercentage > 98) matchPercentage = 98;
      if (matchPercentage < 55) matchPercentage = 55;

      // Don't expose raw embedding vector to client
      delete candidate.embedding;

      return {
        ...candidate,
        skills: candidate.skills || [],
        matchScore: matchPercentage,
        commonSkills: (candidate.skills || []).filter(
          (s) => s && mySkills.has(s.toLowerCase().trim())
        ),
      };
    });

    // Sort by match score descending
    candidatesWithMatchScore.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      data: candidatesWithMatchScore,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: skip + candidates.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Backward compatibility alias: /feed
userRouter.get("/feed", userAuth, async (req, res, next) => {
  req.url = "/user/feed";
  return userRouter.handle(req, res, next);
});

module.exports = userRouter;
