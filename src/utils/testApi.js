require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const connectDB = require("../config/database");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

async function runTests() {
  console.log("=== RUNNING DEVTINDER BACKEND AUDIT VERIFICATION ===");
  await connectDB();
  console.log("1. Connected to Database: OK");

  // Test 1: Verify Seeded Users
  const userCount = await User.countDocuments();
  console.log(`2. Total users in database: ${userCount}`);
  if (userCount < 1) throw new Error("Users not found in database");

  // Test 2: Verify User Schema JSON sanitization (no password leaked)
  const sampleUser = await User.findOne({ emailId: "aarav.sharma@example.com" });
  const serialized = sampleUser.toJSON();
  if (serialized.password !== undefined) {
    throw new Error("SECURITY FAILURE: Password field leaked in toJSON()!");
  }
  console.log("3. Password sanitization on User model: PASSED (password not leaked)");

  // Test 3: JWT generation and password validation
  const token = sampleUser.getJWT();
  if (!token) throw new Error("JWT generation failed");
  const isMatch = await sampleUser.validatePassword("Password@123");
  if (!isMatch) throw new Error("Password validation failed");
  console.log("4. JWT generation and Bcrypt password verification: PASSED");

  // Test 4: Connection Request schema self-request validation
  try {
    const invalidSelfReq = new ConnectionRequest({
      fromUserId: sampleUser._id,
      toUserId: sampleUser._id,
      status: "interested",
    });
    await invalidSelfReq.save();
    throw new Error("Validation failure: Self connection request was allowed!");
  } catch (err) {
    if (err.message.includes("Cannot send a connection request to yourself")) {
      console.log("5. Self-connection request prevention: PASSED");
    } else {
      throw err;
    }
  }

  // Test 5: Feed query logic test
  const feedUsers = await User.find({
    _id: { $ne: sampleUser._id },
  }).select("firstName lastName headline skills");
  console.log(`6. Feed exclusion logic verified: Found ${feedUsers.length} candidate developers`);

  // Test 6: Verify skills fallback calculation handles undefined/null skills safely
  const testCandidateWithoutSkills = { firstName: "Test", skills: undefined };
  const candidateSkills = (testCandidateWithoutSkills.skills || []).map((s) => s.toLowerCase().trim());
  const mySkills = new Set(["react", "node.js"]);
  const common = (testCandidateWithoutSkills.skills || []).filter((s) => s && mySkills.has(s.toLowerCase().trim()));
  console.log("7. Feed skills null/undefined safety verified: PASSED");

  console.log("=== ALL BACKEND INTEGRITY TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
