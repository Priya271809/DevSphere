const mongoose = require("mongoose");

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devTinder";
  await mongoose.connect(dbUri);
};

module.exports = connectDB;
