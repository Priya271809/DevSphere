const AiCache = require("../models/aiCache");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Helper: Call Gemini API with timeout and safe JSON handling
async function callGemini(model, prompt, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          responseMimeType: options.responseMimeType || "text/plain",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } finally {
    clearTimeout(timeout);
  }
}

// 1. Generate text embedding (text-embedding-004)
async function generateEmbedding(text) {
  if (!text || typeof text !== "string") return [];

  if (GEMINI_API_KEY) {
    try {
      const url = `${GEMINI_BASE_URL}/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: text.slice(0, 1000) }] },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.embedding?.values) {
          return data.embedding.values;
        }
      }
    } catch (err) {
      console.warn("Gemini embedding fallback triggered:", err.message);
    }
  }

  // Graceful Fallback: Deterministic vector projection
  const vector = new Array(32).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    vector[i % 32] += (code * (i + 1)) % 100;
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

// 2. Cosine Similarity Calculator
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// 3. Generate "Why you matched" explanation (Cached in MongoDB)
async function getMatchExplanation(userA, userB) {
  const pairKey = `why_matched_${[userA._id.toString(), userB._id.toString()].sort().join("_")}`;

  // Check Cache
  const cached = await AiCache.findOne({ key: pairKey });
  if (cached && cached.data?.explanation) {
    return cached.data.explanation;
  }

  const prompt = `You are a matchmaker for software developers on DevTinder.
Explain in 1 or 2 concise, energetic sentences why these two developers should connect:
Developer 1: ${userA.firstName} (${userA.headline || "Engineer"}). Skills: ${(userA.skills || []).join(", ")}. Looking for: ${userA.lookingFor || "Collaboration"}.
Developer 2: ${userB.firstName} (${userB.headline || "Engineer"}). Skills: ${(userB.skills || []).join(", ")}. Looking for: ${userB.lookingFor || "Collaboration"}.
Highlight shared tech or complementary strengths.`;

  let explanation = "";
  if (GEMINI_API_KEY) {
    try {
      explanation = await callGemini("gemini-1.5-flash", prompt, { temperature: 0.6, timeoutMs: 6000 });
    } catch (err) {
      console.warn("Gemini match explanation fallback:", err.message);
    }
  }

  if (!explanation) {
    // Graceful fallback
    const shared = (userA.skills || []).filter((s) =>
      (userB.skills || []).map((x) => x.toLowerCase()).includes(s.toLowerCase())
    );
    if (shared.length > 0) {
      explanation = `Both of you share strong expertise in ${shared.slice(0, 3).join(", ")}, making you prime candidates for rapid collaboration!`;
    } else {
      explanation = `You both bring complementary skill sets across modern engineering that could build end-to-end fullstack projects together!`;
    }
  }

  // Cache in DB
  await AiCache.findOneAndUpdate(
    { key: pairKey },
    { key: pairKey, type: "match_explanation", data: { explanation } },
    { upsert: true, new: true }
  ).catch(() => {});

  return explanation;
}

// 4. Generate Developer Profile from GitHub REST API
async function generateProfileFromGitHub(githubUsername) {
  if (!githubUsername) throw new Error("GitHub username is required.");

  // Fetch Public Repos from GitHub
  const ghResponse = await fetch(
    `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=8`,
    { headers: { "User-Agent": "DevTinder-App" } }
  );

  if (!ghResponse.ok) {
    throw new Error(`GitHub user '${githubUsername}' not found or rate-limited.`);
  }

  const repos = await ghResponse.json();
  if (!Array.isArray(repos) || repos.length === 0) {
    throw new Error("No public repositories found for this GitHub account.");
  }

  const repoSummary = repos.map((r) => ({
    name: r.name,
    description: r.description || "",
    language: r.language || "",
    topics: r.topics || [],
    stars: r.stargazers_count || 0,
  }));

  const prompt = `Analyze this GitHub developer's repositories and generate a professional profile for DevTinder.
Repositories: ${JSON.stringify(repoSummary)}

Return ONLY valid JSON strictly matching this schema:
{
  "bio": "2-3 sentences engaging developer bio highlighting their strengths and current coding focus",
  "skills": ["Array", "of", "top", "5-8", "technical", "skills", "languages", "tools"],
  "lookingFor": "One of: Co-founder, Hackathon Partner, Project Collaborator, Mentorship, Casual Networking"
}`;

  let result = null;
  if (GEMINI_API_KEY) {
    try {
      const rawJson = await callGemini("gemini-1.5-flash", prompt, {
        temperature: 0.5,
        responseMimeType: "application/json",
      });
      result = JSON.parse(rawJson);
    } catch (err) {
      console.warn("Gemini GitHub profile generation fallback:", err.message);
    }
  }

  if (!result) {
    // Deterministic fallback
    const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
    const topSkills = languages.length > 0 ? languages : ["JavaScript", "TypeScript", "Node.js"];
    result = {
      bio: `Active open-source builder on GitHub with recent projects including ${repos.slice(0, 2).map((r) => r.name).join(" and ")}. Passionate about clean code and modern developer tooling.`,
      skills: topSkills,
      lookingFor: "Project Collaborator",
    };
  }

  return result;
}

// 5. Generate Icebreakers for newly matched developers (Cached in MongoDB)
async function getIcebreakers(userA, userB) {
  const pairKey = `icebreakers_${[userA._id.toString(), userB._id.toString()].sort().join("_")}`;

  const cached = await AiCache.findOne({ key: pairKey });
  if (cached && Array.isArray(cached.data?.icebreakers)) {
    return cached.data.icebreakers;
  }

  const prompt = `Two software developers just matched on DevTinder:
Dev 1: ${userA.firstName}, Skills: ${(userA.skills || []).join(", ")}, Looking for: ${userA.lookingFor || "Projects"}
Dev 2: ${userB.firstName}, Skills: ${(userB.skills || []).join(", ")}, Looking for: ${userB.lookingFor || "Projects"}

Generate 3 natural, non-cringe conversation starter questions or icebreakers for Dev 1 to send to Dev 2.
Return ONLY valid JSON matching this schema:
{
  "icebreakers": ["Icebreaker 1", "Icebreaker 2", "Icebreaker 3"]
}`;

  let icebreakers = [];
  if (GEMINI_API_KEY) {
    try {
      const rawJson = await callGemini("gemini-1.5-flash", prompt, {
        temperature: 0.7,
        responseMimeType: "application/json",
      });
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed.icebreakers)) {
        icebreakers = parsed.icebreakers;
      }
    } catch (err) {
      console.warn("Gemini icebreakers fallback:", err.message);
    }
  }

  if (icebreakers.length === 0) {
    const firstSkill = (userB.skills || [])[0] || "web development";
    icebreakers = [
      `Hey ${userB.firstName}! Noticed you work with ${firstSkill}. What's the coolest project you've built with it?`,
      `Saw you're interested in ${userB.lookingFor || "collaborating"}. Are you working on any hackathon ideas right now?`,
      `Tabs or spaces, and what does your ideal tech stack look like this year?`,
    ];
  }

  await AiCache.findOneAndUpdate(
    { key: pairKey },
    { key: pairKey, type: "icebreakers", data: { icebreakers } },
    { upsert: true, new: true }
  ).catch(() => {});

  return icebreakers;
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  getMatchExplanation,
  generateProfileFromGitHub,
  getIcebreakers,
};
