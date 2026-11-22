require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const connectDB = require("../config/database");
const User = require("../models/user");

async function fixPhotos() {
  await connectDB();
  console.log("Connected to MongoDB for avatar URL optimization...");

  const users = await User.find({});
  let count = 0;

  for (const user of users) {
    const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      user.firstName || "dev"
    )}&backgroundColor=0f172a,1e293b,334155`;

    // If photoUrl is empty or missing, give them a guaranteed avatar
    if (!user.photoUrl || user.photoUrl.trim() === "") {
      user.photoUrl = dicebearUrl;
      await user.save();
      count++;
    }
  }

  console.log(`Updated ${count} users with verified developer avatar URLs.`);
  process.exit(0);
}

fixPhotos().catch((err) => {
  console.error("Error updating photos:", err);
  process.exit(1);
});
