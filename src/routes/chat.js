const express = require("express");
const chatRouter = express.Router();
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const ChatMessage = require("../models/chatMessage");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_FIELDS =
  "firstName lastName photoUrl headline age gender about skills location lookingFor";

/* ================= 1. GET ALL CONVERSATIONS / MATCHES ================= */
chatRouter.get("/chat/conversations", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    // Find all accepted connection requests
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS)
      .sort({ updatedAt: -1 });

    const conversations = await Promise.all(
      connections.map(async (conn) => {
        const isFromMe = conn.fromUserId._id.toString() === loggedInUser._id.toString();
        const counterpart = isFromMe ? conn.toUserId : conn.fromUserId;
        if (!counterpart) return null;

        // Fetch latest message between these two users
        const latestMsg = await ChatMessage.findOne({
          $or: [
            { senderId: loggedInUser._id, receiverId: counterpart._id },
            { senderId: counterpart._id, receiverId: loggedInUser._id },
          ],
        }).sort({ createdAt: -1 });

        // Unread messages count
        const unreadCount = await ChatMessage.countDocuments({
          senderId: counterpart._id,
          receiverId: loggedInUser._id,
          isRead: false,
        });

        return {
          counterpart: counterpart.toObject ? counterpart.toObject() : counterpart,
          connectionId: conn._id,
          latestMessage: latestMsg
            ? {
                text: latestMsg.text,
                senderId: latestMsg.senderId,
                createdAt: latestMsg.createdAt,
              }
            : {
                text: "Matched! Say hello and start collaborating.",
                senderId: null,
                createdAt: conn.updatedAt,
              },
          unreadCount,
          isPinned: false,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: conversations.filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
});

/* ================= 2. GET MESSAGES FOR A USER ================= */
chatRouter.get("/chat/messages/:targetUserId", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid target user ID." });
    }

    // Mark unread messages as read
    await ChatMessage.updateMany(
      { senderId: targetUserId, receiverId: loggedInUser._id, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await ChatMessage.find({
      $or: [
        { senderId: loggedInUser._id, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: loggedInUser._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= 3. SEND A MESSAGE ================= */
chatRouter.post("/chat/messages/:targetUserId", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Message text cannot be empty." });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid target user ID." });
    }

    const newMsg = new ChatMessage({
      senderId: loggedInUser._id,
      receiverId: targetUserId,
      text: text.trim(),
    });

    const savedMsg = await newMsg.save();

    return res.status(201).json({
      success: true,
      data: savedMsg,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = chatRouter;
