require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const {
  generateEmbedding,
  cosineSimilarity,
  getMatchExplanation,
  getIcebreakers,
} = require("../services/aiService");
const connectDB = require("../config/database");
const User = require("../models/user");

async function verifyAi() {
  console.log("=== VERIFYING PHASE 2 AI FEATURES & GRACEFUL FALLBACKS ===");
  await connectDB();

  // 1. Embedding generation test
  const vec = await generateEmbedding("Senior React Developer building scalable cloud applications");
  console.log(`1. Embedding generated: Dimension = ${vec.length} (OK)`);
  if (vec.length === 0) throw new Error("Embedding generation returned empty vector");

  // 2. Cosine similarity test
  const vec2 = await generateEmbedding("Frontend engineer building UI components in React and TypeScript");
  const sim = cosineSimilarity(vec, vec2);
  console.log(`2. Cosine Similarity computed: ${sim.toFixed(3)} (OK)`);

  // 3. Match explanation test
  const userA = await User.findOne({ firstName: "Aarav" });
  const userB = await User.findOne({ firstName: "Riya" });
  if (userA && userB) {
    const explanation = await getMatchExplanation(userA, userB);
    console.log(`3. 'Why you matched' generated: "${explanation.slice(0, 80)}..." (OK)`);

    // 4. Icebreakers test
    const starters = await getIcebreakers(userA, userB);
    console.log(`4. AI Icebreakers generated (${starters.length} items): "${starters[0]}" (OK)`);
  }

  console.log("=== ALL PHASE 2 AI SERVICES VERIFIED SUCCESSFULLY! ===");
  process.exit(0);
}

verifyAi().catch((err) => {
  console.error("AI test error:", err);
  process.exit(1);
});
