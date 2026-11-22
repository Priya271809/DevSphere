require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const connectDB = require("../config/database");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const ChatMessage = require("../models/chatMessage");

const UNIQUE_PORTRAITS = {
  // Male portraits
  "Aarav": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  "Kabir": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "Devon": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "Lucas": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  "Vikram": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
  "Rohan": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  "Liam": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
  "Tariq": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80",
  "Mateo": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
  "Kenji": "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=600&q=80",
  "virat": "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=600&q=80",
  "Rohit": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",

  // Female portraits
  "Riya": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "Ananya": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  "Sneha": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
  "Meera": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  "Elena": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80",
  "Pooja": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
  "Divya": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  "Simran": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "Zoya": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
  "Nandini": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
  "Priya": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "Rishika": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
};

const RANDOM_FALLBACKS_FEMALE = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
];

const RANDOM_FALLBACKS_MALE = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
];

async function updateUniquePhotos() {
  await connectDB();
  console.log("Connected to MongoDB for unique photo assignment...");

  const users = await User.find({});
  let updatedCount = 0;

  for (const user of users) {
    let matchedPhoto = UNIQUE_PORTRAITS[user.firstName];

    if (!matchedPhoto) {
      if (user.gender === "female") {
        matchedPhoto = RANDOM_FALLBACKS_FEMALE[updatedCount % RANDOM_FALLBACKS_FEMALE.length];
      } else {
        matchedPhoto = RANDOM_FALLBACKS_MALE[updatedCount % RANDOM_FALLBACKS_MALE.length];
      }
    }

    user.photoUrl = matchedPhoto;
    await user.save();
    updatedCount++;
    console.log(`Updated photo for: ${user.firstName} (${user.gender}) -> ${matchedPhoto.slice(0, 45)}...`);
  }

  console.log(`\nAll ${updatedCount} users now have distinct portraits!`);

  // Setup sample chat conversations for testing
  const aarav = await User.findOne({ emailId: "aarav.sharma@example.com" });
  const riya = await User.findOne({ emailId: "riya.verma@example.com" });
  const devon = await User.findOne({ emailId: "devon.carter@example.com" });

  if (aarav && riya) {
    // Ensure Aarav and Riya are connected
    let conn = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: aarav._id, toUserId: riya._id },
        { fromUserId: riya._id, toUserId: aarav._id },
      ],
    });

    if (!conn) {
      conn = await ConnectionRequest.create({
        fromUserId: aarav._id,
        toUserId: riya._id,
        status: "accepted",
      });
    } else {
      conn.status = "accepted";
      await conn.save();
    }

    // Seed realistic sample messages
    const existingMessages = await ChatMessage.countDocuments({
      $or: [
        { senderId: aarav._id, receiverId: riya._id },
        { senderId: riya._id, receiverId: aarav._id },
      ],
    });

    if (existingMessages === 0) {
      await ChatMessage.create([
        {
          senderId: riya._id,
          receiverId: aarav._id,
          text: "Hi Aarav! Saw your profile on DevTinder. I noticed you work with React and AWS architecture!",
        },
        {
          senderId: aarav._id,
          receiverId: riya._id,
          text: "Hey Riya! Yes, building distributed microservices. I loved your Next.js projects on GitHub!",
        },
        {
          senderId: riya._id,
          receiverId: aarav._id,
          text: "Awesome! Would love to collaborate on a hackathon project this weekend. Are you free to discuss?",
        },
      ]);
      console.log("Seeded sample chat conversation between Aarav and Riya!");
    }
  }

  if (aarav && devon) {
    let conn2 = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: aarav._id, toUserId: devon._id },
        { fromUserId: devon._id, toUserId: aarav._id },
      ],
    });

    if (!conn2) {
      conn2 = await ConnectionRequest.create({
        fromUserId: devon._id,
        toUserId: aarav._id,
        status: "accepted",
      });
    } else {
      conn2.status = "accepted";
      await conn2.save();
    }

    const devonMsgs = await ChatMessage.countDocuments({
      $or: [
        { senderId: aarav._id, receiverId: devon._id },
        { senderId: devon._id, receiverId: aarav._id },
      ],
    });

    if (devonMsgs === 0) {
      await ChatMessage.create([
        {
          senderId: devon._id,
          receiverId: aarav._id,
          text: "Hey Aarav! We matched based on AI semantic alignment. Working on any LLM agent workflows right now?",
        },
      ]);
      console.log("Seeded sample chat conversation between Aarav and Devon!");
    }
  }

  process.exit(0);
}

updateUniquePhotos().catch((err) => {
  console.error(err);
  process.exit(1);
});
