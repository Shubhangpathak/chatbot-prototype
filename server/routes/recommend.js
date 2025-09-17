// server/routes/recommend.js
require("dotenv").config();

const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const { extractTags, detectIntent, normalizeWord } = require("../nlp/parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// In-memory session memory for demo (use Redis / DB for prod)
const sessionMemory = {}; // keyed by userId

function ensureMemory(userId) {
  if (!sessionMemory[userId]) {
    sessionMemory[userId] = {
      lastIntent: null,
      lastTags: [],
      lastCourses: [],
      lastOffset: 0,
      history: [] // store up to last 5 queries
    };
  }
  return sessionMemory[userId];
}

// follow-up trigger phrases
const FOLLOWUP_TRIGGERS = [
  "show me more", "more", "another one", "few more", "tell me more",
  "continue", "yes", "please", "i want more", "recommend more"
];

// --- Gemini enrichment for course details ---
// --- Gemini enrichment for course details with retry ---
async function enrichDetailReply(course, baseAnswer, userMessage = "") {
  if (!process.env.USE_LLM || process.env.USE_LLM !== "true") return baseAnswer;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });

  const prompt = `
You are Mentora, a helpful learning assistant.
The user asked: "${userMessage}"
Here is the raw course info:
Title: ${course.course_title}
Provider: ${course.provider || "N/A"}
Level: ${course.level || "N/A"}
Price: ${course.price || "N/A"}
Duration: ${course.content_duration || "N/A"}
Rating: ${course.rating || "N/A"}
Reviews: ${course.num_reviews || "N/A"}
Subscribers: ${course.num_subscribers || "N/A"}

Base Answer: ${baseAnswer}

Rewrite this as a short, friendly conversational reply:
- Natural phrasing (not robotic).
- Highlight the course in a positive way.
- Keep it under 4 sentences.
- Add 1–2 emojis where natural.
  `;

  let attempts = 0;
  while (attempts < 3) {
    try {
      const result = await model.generateContent(prompt);
      return result?.response?.text?.() || result?.response?.text || baseAnswer;
    } catch (err) {
      if (err.status === 503) {
        attempts++;
        console.warn(`Gemini overloaded, retrying... attempt ${attempts}`);
        await new Promise(r => setTimeout(r, 500 * attempts)); // exponential backoff
      } else {
        console.error("Gemini enrichment error:", err);
        break;
      }
    }
  }

  return baseAnswer; // fallback if all retries fail
}


// helper: parse "tell me about 2" or "#3"
function parseRequestedIndex(text) {
  const nums = text.match(/\d+/g);
  if (nums && nums.length) {
    const n = parseInt(nums[0], 10);
    return Number.isNaN(n) ? null : n - 1;
  }
  if (text.includes("first")) return 0;
  if (text.includes("second")) return 1;
  if (text.includes("third")) return 2;
  return null;
}

router.post("/chat", async (req, res) => {
  try {
    let { message = "", skills = [], interests = [], userId: incomingUserId } = req.body;
    const userId = incomingUserId || "user1";
    const memory = ensureMemory(userId);

    // If no message but user has chosen skills/interests -> auto-build query
    if (!message || !message.trim()) {
      if ((skills && skills.length) || (interests && interests.length)) {
        message = `recommend courses for ${skills.join(", ")} ${interests.join(", ")}`.trim();
      } else {
        return res.json({
          reply: "😅 Oops — nothing detected. Try asking about a course or select skills/interests.",
          courses: []
        });
      }
    }

    const text = message.toLowerCase();
    const intent = detectIntent(message);

    // --- 1) Follow-ups ---
    const isFollowUp = FOLLOWUP_TRIGGERS.some(t => text.includes(t));
    if (isFollowUp && memory.lastCourses && memory.lastCourses.length) {
      const nextBatch = memory.lastCourses.slice(memory.lastOffset, memory.lastOffset + 5);
      if (nextBatch.length > 0) {
        memory.lastOffset += nextBatch.length;
        return res.json({
          reply: "📚 Here are more courses similar to your last search:",
          courses: nextBatch.map(c => ({
            title: c.course_title,
            rating: c.rating,
            reviews: c.num_reviews,
            url: c.url,
            level: c.level,
            price: c.price,
            duration: c.content_duration
          }))
        });
      } else {
        return res.json({
          reply: "🤔 You’ve already seen all the courses I found. Try a new topic or refine your interests.",
          courses: []
        });
      }
    }

    // --- 2) Ask about specific course ---
    const requestedIndex = parseRequestedIndex(text);
    if (requestedIndex !== null && memory.lastCourses && memory.lastCourses.length > requestedIndex) {
      const course = memory.lastCourses[requestedIndex];

      let baseReply = `📘 ${course.course_title}`;
      const detailsParts = [];
      if (course.level) detailsParts.push(`Level: ${course.level}`);
      if (course.content_duration) detailsParts.push(`Duration: ${course.content_duration}`);
      if (course.price !== undefined && course.price !== null) detailsParts.push(`Price: $${course.price}`);
      if (course.provider) detailsParts.push(`Provider: ${course.provider}`);
      baseReply += "\n" + detailsParts.join(" • ");

      let detailReply = baseReply;
      if (process.env.USE_LLM === "true") {
        const enriched = await enrichDetailReply(course, baseReply, message);
        if (enriched) detailReply = enriched;
      }

      return res.json({ reply: detailReply, courses: [] });
    }

    // --- 3) Greetings / Smalltalk / Farewell ---
    if (intent === "greeting") return res.json({ reply: "👋 Hey! I’m Mentora — tell me your skills/interests and I’ll suggest courses.", courses: [] });
    if (intent === "smalltalk") return res.json({ reply: "🙂 I can help you find courses. Try: 'show me AI courses' or select skills on the left.", courses: [] });
    if (intent === "farewell") return res.json({ reply: "🙏 Good luck! Come back anytime to explore more courses.", courses: [] });

    // 4) question intent (time/cost/level) - DB-first -> LLM fallback
    if (intent === "question") {
      const lastCourses = memory.lastCourses || [];
      if (lastCourses.length) {
        // Try to detect which course user is asking about
        let course = lastCourses[0]; // default first
        const requestedIndex = parseRequestedIndex(text);
        if (requestedIndex !== null && lastCourses[requestedIndex]) {
          course = lastCourses[requestedIndex];
        } else {
          // fuzzy match by title keyword
          for (const c of lastCourses) {
            if (text.includes(c.course_title.toLowerCase().split(" ")[0])) {
              course = c;
              break;
            }
          }
        }

        // Beginner/difficulty
        if (text.includes("beginner") || text.includes("difficulty") || text.includes("level")) {
          if (course.level) {
            let baseAnswer = `📘 "${course.course_title}" is suitable for ${course.level} learners.`;
            if (process.env.USE_LLM === "true") {
              const enriched = await enrichDetailReply(course, baseAnswer, message);
              if (enriched) baseAnswer = enriched;
            }
            return res.json({ reply: baseAnswer, courses: [] });
          }
        }

        // Duration
        if (text.includes("time") || text.includes("duration") || text.includes("long")) {
          if (course.content_duration) {
            let baseAnswer = `⏱️ "${course.course_title}" takes about ${course.content_duration} to complete.`;
            if (process.env.USE_LLM === "true") {
              const enriched = await enrichDetailReply(course, baseAnswer, message);
              if (enriched) baseAnswer = enriched;
            }
            return res.json({ reply: baseAnswer, courses: [] });
          }
        }

        // Price
        if (text.includes("price") || text.includes("cost") || text.includes("fee")) {
          if (course.price !== undefined && course.price !== null) {
            let baseAnswer = `💰 "${course.course_title}" costs around $${course.price}.`;
            if (process.env.USE_LLM === "true") {
              const enriched = await enrichDetailReply(course, baseAnswer, message);
              if (enriched) baseAnswer = enriched;
            }
            return res.json({ reply: baseAnswer, courses: [] });
          }
        }

        // fallback to Gemini
        if (process.env.USE_LLM === "true") {
          const enriched = await enrichReply(message, memory.lastTags, lastCourses.slice(0, 3), "question", memory.history);
          if (enriched) return res.json({ reply: enriched, courses: [] });
        }

        return res.json({ reply: "🤔 I don’t have that exact info. Try asking about duration, price, or level.", courses: [] });
      }
    }


    // --- 5) If not recommend ---
    if (intent !== "recommend") {
      if (memory.lastIntent === "recommend" && text.length < 20) {
        const nextBatch = memory.lastCourses.slice(memory.lastOffset, memory.lastOffset + 5);
        if (nextBatch.length > 0) {
          memory.lastOffset += nextBatch.length;
          return res.json({
            reply: "📚 Here are more courses similar to your last search:",
            courses: nextBatch.map(c => ({
              title: c.course_title,
              rating: c.rating,
              reviews: c.num_reviews,
              url: c.url
            }))
          });
        }
      }
      return res.json({ reply: "💡 You can ask 'I want to learn coding' or 'recommend AI courses'.", courses: [] });
    }

    // --- 6) Recommendation intent ---
    const normalizedSelectedSkills = (skills || []).map(s => normalizeWord((s || "").toString().toLowerCase().replace(/\s*\/\s*/g, "/")) || s.toString().toLowerCase()).filter(Boolean);
    const normalizedInterests = (interests || []).map(i => normalizeWord((i || "").toString().toLowerCase()) || i.toString().toLowerCase()).filter(Boolean);

    const messageTags = extractTags(message);
    const mergedInterests = [...new Set([...(normalizedInterests || []), ...(messageTags || [])])];

    const explicitNewTopics = messageTags.filter(t => !normalizedInterests.includes(t) && !normalizedSelectedSkills.includes(t));
    const proposeSwitchQuickReplies = explicitNewTopics.slice(0, 3).map(t => `Switch interest to "${t}"`);

    const searchTags = [...new Set([...(normalizedSelectedSkills || []), ...mergedInterests])];

    if (!searchTags.length) {
      return res.json({ reply: "Sorry, I couldn't identify a topic. Try 'I want to learn AI' or select skills/interests.", courses: [] });
    }

    const candidates = await Course.find({ $or: [{ tags: { $in: searchTags } }, { skills: { $in: searchTags } }] }).limit(200);

    const scored = candidates.map(course => {
      let score = 0;
      const courseSkills = (course.skills || []).map(s => s.toLowerCase());
      const courseTags = (course.tags || []).map(t => t.toLowerCase());

      const skillOverlap = (normalizedSelectedSkills || []).filter(s => courseSkills.includes(s) || courseTags.includes(s)).length;
      const skillDen = Math.max(1, (normalizedSelectedSkills || []).length);
      score += (skillOverlap / skillDen) * 0.6;

      const interestOverlap = (mergedInterests || []).filter(i => courseTags.includes(i) || courseSkills.includes(i)).length;
      const interestDen = Math.max(1, (mergedInterests || []).length);
      score += (interestOverlap / interestDen) * 0.3;

      const messageOverlap = (messageTags || []).filter(m => courseTags.includes(m) || courseSkills.includes(m)).length;
      const messageDen = Math.max(1, (messageTags || []).length);
      score += (messageOverlap / messageDen) * 0.1;

      return { course, score };
    });

    scored.sort((a, b) => (b.score - a.score) || ((b.course.rating || 0) - (a.course.rating || 0)));
    const topCourses = scored.slice(0, 5).map(s => s.course);

    if (topCourses.length) {
      memory.lastIntent = "recommend";
      memory.lastTags = searchTags;
      memory.lastCourses = candidates;
      memory.lastOffset = Math.min(5, candidates.length);

      memory.history.push({ message, tags: searchTags });
      if (memory.history.length > 5) memory.history.shift();

      let baseReply = `✨ Based on your selected skills and message, here are some top matches.${explicitNewTopics.length ? `\n💡 I also considered: ${explicitNewTopics.join(", ")}.` : ""}`;

      const quickReplies = [
        "Tell me more",
        "How long does this take?",
        "Is this for beginners?",
        "Show me more"
      ];

      topCourses.forEach((c, i) => {
        quickReplies.push(`Tell me about #${i + 1}`);
      });
      proposeSwitchQuickReplies.forEach(s => quickReplies.push(s));

      return res.json({
        reply: baseReply,
        courses: topCourses.map(c => ({
          title: c.course_title,
          rating: c.rating,
          reviews: c.num_reviews,
          url: c.url,
          level: c.level,
          price: c.price,
          duration: c.content_duration,
          provider: c.provider
        })),
        quickReplies,
        history: memory.history
      });
    } else {
      return res.json({ reply: `Couldn't find good matches for ${searchTags.join(", ")}. Try adding or changing skills/interests.`, courses: [] });
    }
  } catch (err) {
    console.error("recommend error:", err);
    return res.json({ reply: " Something went wrong. Try again or check server logs.", courses: [] });
  }
});

module.exports = router;
