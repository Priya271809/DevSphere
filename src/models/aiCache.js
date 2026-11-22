const mongoose = require("mongoose");

const aiCacheSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["match_explanation", "icebreakers", "github_profile"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire cached AI responses after 14 days
aiCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

const AiCache = mongoose.models.AiCache || mongoose.model("AiCache", aiCacheSchema);
module.exports = AiCache;
