const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    emailId: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    age: {
      type: Number,
      min: [16, "Minimum age requirement is 16"],
      max: [100, "Maximum age is 100"],
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender option",
      },
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Full Stack Developer",
    },
    photoUrl: {
      type: String,
      trim: true,
      default: "",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      trim: true,
      maxlength: 600,
      default: "Passionate developer looking to connect, build cool projects, and share knowledge.",
    },
    skills: {
      type: [String],
      default: ["JavaScript", "React", "Node.js"],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "Remote / Open to relocate",
    },
    lookingFor: {
      type: String,
      default: "Project Collaborator",
      enum: [
        "Co-founder",
        "Hackathon Partner",
        "Project Collaborator",
        "Mentorship",
        "Casual Networking",
      ],
    },
    // Reserved vector field for AI Semantic Matching (Phase 2)
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate signed JWT token
userSchema.methods.getJWT = function () {
  const user = this;
  const secret = process.env.JWT_SECRET || "devtinder_super_secret_jwt_key_2026_secure";
  return jwt.sign({ _id: user._id }, secret, {
    expiresIn: "7d",
  });
};

// Method to validate hashed password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  return bcrypt.compare(passwordInputByUser, user.password);
};

// Automatically sanitize and strip sensitive fields (password, embedding, __v) from JSON output
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.embedding;
  delete userObj.__v;
  return userObj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
