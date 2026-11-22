const express = require("express");
const requestRouter = express.Router();
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

/* ================= SEND CONNECTION REQUEST (INTERESTED / IGNORED) ================= */
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res, next) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;

    // 1. Validate status param
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: `Invalid status type: '${status}'. Allowed types: 'interested', 'ignored'` });
    }

    // 2. Validate toUserId MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ error: "Invalid target user ID." });
    }

    // 3. Prevent sending request to self
    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({ error: "You cannot send a connection request to yourself!" });
    }

    // 4. Verify target user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: "Target developer not found." });
    }

    // 5. Prevent duplicate connection requests in either direction
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(409).json({
        error: "A connection request already exists between you and this developer.",
        status: existingConnectionRequest.status,
      });
    }

    // 6. Create and save new request
    const newRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await newRequest.save();

    return res.status(201).json({
      success: true,
      message:
        status === "interested"
          ? `Interest sent to ${toUser.firstName}!`
          : `Profile from ${toUser.firstName} was ignored.`,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= REVIEW CONNECTION REQUEST (ACCEPTED / REJECTED) ================= */
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    // 1. Validate status param
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: `Invalid review status: '${status}'. Allowed: 'accepted', 'rejected'` });
    }

    // 2. Validate requestId ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid connection request ID." });
    }

    // 3. Find pending request where logged-in user is receiver and status is 'interested'
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName photoUrl headline");

    if (!connectionRequest) {
      return res.status(404).json({ error: "Pending connection request not found or already reviewed." });
    }

    // 4. Update status and save
    connectionRequest.status = status;
    const data = await connectionRequest.save();

    return res.status(200).json({
      success: true,
      message:
        status === "accepted"
          ? `Connection request accepted! You are now connected with ${connectionRequest.fromUserId?.firstName || "the developer"}.`
          : "Connection request rejected.",
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = requestRouter;
