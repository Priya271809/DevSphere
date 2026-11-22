const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is not a valid connection status",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connection requests between the same pair
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
connectionRequestSchema.index({ toUserId: 1, status: 1 });

// Prevent sending a request to oneself
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
  if (connectionRequest.fromUserId && connectionRequest.toUserId && connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send a connection request to yourself!");
  }
});

const ConnectionRequest =
  mongoose.models.ConnectionRequest ||
  mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
