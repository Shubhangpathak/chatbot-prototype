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

// LLM enrichment (optional)
async function enrichReply(userMessage, tags, courses, intent, history = []) {
  if (!process.env.GEMINI_API_KEY || process.env.USE_LLM !== "true") return null;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const courseSummary = courses
      .map((c, i) => `${i + 1}. ${c.course_title} — ${c.rating || "N/A"}⭐ (${c.num_reviews || 0} reviews)`)
      .join("\n");

    const convoSnippet = history.slice(-6).map(h => `User: ${h.message}`).join("\n");

    const prompt = `
You are Mentora, a friendly learning assistant.
Conversation context:
${convoSnippet}

User asked: "${userMessage}"
Detected intent: ${intent}
Their skills/interests: ${tags.join(", ")}

Recommended courses:
${courseSummary}

Instructions:
- If intent = greeting/smalltalk/farewell → reply casually, no courses.
- If intent = recommend → highlight 2–3 courses in natural language and list each highlighted course on its own line.
- If intent = question and DB lacks the exact field -> answer gracefully using general knowledge.
- Keep under 5 sentences.
- Use emojis naturally.
    `;

    const result = await model.generateContent(prompt);
    // SDK may differ; handle both shapes
    if (result?.response?.text) return result.response.text();
    return result?.text || null;
  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
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
    // Use `let` so we can mutate message if we need to auto-build it
    let { message = "", skills = [], interests = [], userId: incomingUserId } = req.body;
    const userId = incomingUserId || "user1";
    const memory = ensureMemory(userId);

    // If no message typed but user has chosen skills or interests -> auto-build a recommend query
    if (!message || !message.trim()) {
      if ((Array.isArray(skills) && skills.length > 0) || (Array.isArray(interests) && interests.length > 0)) {
        message = `recommend courses for ${skills.join(", ")} ${interests.join(", ")}`.trim();
      } else {
        return res.json({
          reply: "😅 Oops — nothing detected. Try asking about a course or select skills/interests.",
          courses: []
        });
      }
    }

    // ✅ only define once here, after fixing message
    const text = message.toLowerCase();
    const intent = detectIntent(message);

    // 1) Follow-ups: explicit "more", "tell me more", etc.
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
        return res.json({ reply: "🤔 You’ve already seen all the courses I found. Try a new topic or refine your interests.", courses: [] });
      }
    }

    // 2) Ask about specific item by index: "tell me about 2"
    const requestedIndex = parseRequestedIndex(text);
    if (requestedIndex !== null && memory.lastCourses && memory.lastCourses.length > requestedIndex) {
      const course = memory.lastCourses[requestedIndex];
      const parts = [];
      if (course.level) parts.push(`Level: ${course.level}`);
      if (course.content_duration) parts.push(`Duration: ${course.content_duration}`);
      if (course.price !== undefined && course.price !== null) parts.push(`Price: ${course.price}`);
      if (course.provider) parts.push(`Provider: ${course.provider}`);

      let detailReply = `📘 ${course.course_title}\n${parts.join(" • ")}`;
      if (parts.length < 2 && process.env.USE_LLM === "true") {
        const gReply = await enrichReply(message, memory.lastTags, [course], "question", memory.history);
        if (gReply) detailReply = gReply;
      }
      return res.json({ reply: detailReply, courses: [] });
    }

    // 3) greeting / smalltalk / farewell
    if (intent === "greeting") return res.json({ reply: "👋 Hey! I’m Mentora — tell me your skills/interests and I’ll suggest courses.", courses: [] });
    if (intent === "smalltalk") return res.json({ reply: "🙂 I can help you find courses. Try: 'show me AI courses' or select skills on the left.", courses: [] });
    if (intent === "farewell") return res.json({ reply: "🙏 Good luck! Come back anytime to explore more courses.", courses: [] });

    // 4) question intent (time/cost/level) - DB-first -> LLM fallback
    if (intent === "question") {
      const lastCourses = memory.lastCourses || [];
      if (lastCourses.length) {
        const first = lastCourses[0];

        // Beginner/difficulty
        if (message.toLowerCase().includes("beginner")) {
          if (first.level) {
            return res.json({ reply: `📘 "${first.course_title}" is suitable for ${first.level} learners.`, courses: [] });
          }
        }

        // Duration
        if (message.toLowerCase().includes("time") || message.toLowerCase().includes("duration")) {
          if (first.content_duration) {
            return res.json({ reply: `⏱️ "${first.course_title}" takes about ${first.content_duration} to complete.`, courses: [] });
          }
        }

        // Price
        if (message.toLowerCase().includes("price") || message.toLowerCase().includes("cost")) {
          if (first.price) {
            return res.json({ reply: `💰 "${first.course_title}" costs around ${first.price}.`, courses: [] });
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

    // 5) if not recommend intent, treat short replies as potential follow-up (convenient UX)
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



    // --- At this point, intent === "recommend" -- proceed ---

    // Normalize selected skills & interests using parser normalizeWord
    const normalizedSelectedSkills = (skills || []).map(s => normalizeWord((s || "").toString().toLowerCase().replace(/\s*\/\s*/g, "/")) || s.toString().toLowerCase()).filter(Boolean);
    const normalizedInterests = (interests || []).map(i => normalizeWord((i || "").toString().toLowerCase()) || i.toString().toLowerCase()).filter(Boolean);

    // message tags (includes synonyms + expansions)
    const messageTags = extractTags(message); // already normalized and expanded in parser

    // Merge tags but keep selected skills primary
    // mergedInterests = UI interests + messageTags (so message "i want to code" matters)
    const mergedInterests = [...new Set([...(normalizedInterests || []), ...(messageTags || [])])];

    // If user explicitly asks about topic not in UI interests (e.g., marketing) propose a quick-reply to switch
    const explicitNewTopics = messageTags.filter(t => !normalizedInterests.includes(t) && !normalizedSelectedSkills.includes(t));
    const proposeSwitchQuickReplies = explicitNewTopics.slice(0, 3).map(t => `Switch interest to "${t}"`);

    // Build search tags (use both skills and interests)
    const searchTags = [...new Set([...(normalizedSelectedSkills || []), ...mergedInterests])];

    if (!searchTags.length) {
      // LLM can try to guess topic if enabled
      if (process.env.USE_LLM === "true") {
        const guess = await enrichReply(message, [], [], "recommend", memory.history);
        if (guess) {
          return res.json({ reply: `${guess}\nDo you want me to show courses for that?`, courses: [], quickReplies: ["Yes show courses", "No, something else"] });
        }
      }
      return res.json({ reply: "Sorry, I couldn't identify a topic. Try 'I want to learn AI' or select skills/interests.", courses: [] });
    }

    // Query DB broadly (tags or skills match)
    const candidates = await Course.find({ $or: [{ tags: { $in: searchTags } }, { skills: { $in: searchTags } }] }).limit(200);

    // Weighted scoring:
    // - selected skills carry priority (0.6)
    // - mergedInterests (UI interests + message tags) contribute (0.3)
    // - synergy bonus if course matches messageTags (0.1) so "AI + code" preference works
    const scored = candidates.map(course => {
      let score = 0;

      // normalize course arrays to lowercase
      const courseSkills = (course.skills || []).map(s => s.toLowerCase());
      const courseTags = (course.tags || []).map(t => t.toLowerCase());

      // selected skills overlap (primary)
      const skillOverlap = (normalizedSelectedSkills || []).filter(s => courseSkills.includes(s) || courseTags.includes(s)).length;
      const skillDen = Math.max(1, (normalizedSelectedSkills || []).length);
      score += (skillOverlap / skillDen) * 0.6;

      // interests (UI interests + message tags)
      const interestOverlap = (mergedInterests || []).filter(i => courseTags.includes(i) || courseSkills.includes(i)).length;
      const interestDen = Math.max(1, (mergedInterests || []).length);
      score += (interestOverlap / interestDen) * 0.3;

      // synergy: emphasize courses that match messageTags (user typed "code")
      const messageOverlap = (messageTags || []).filter(m => courseTags.includes(m) || courseSkills.includes(m)).length;
      const messageDen = Math.max(1, (messageTags || []).length);
      score += (messageOverlap / messageDen) * 0.1;

      // small popularity tie-breaker (rating)
      return { course, score };
    });

    // sort by score desc, then rating desc
    scored.sort((a, b) => (b.score - a.score) || ((b.course.rating || 0) - (a.course.rating || 0)));

    const topCourses = scored.slice(0, 5).map(s => s.course);

    if (topCourses.length) {
      // save memory
      memory.lastIntent = "recommend";
      memory.lastTags = searchTags;
      memory.lastCourses = candidates;
      memory.lastOffset = Math.min(5, candidates.length);

      memory.history.push({ message, tags: searchTags });
      if (memory.history.length > 5) memory.history.shift();

      // reply base text (we'll allow LLM to rephrase if enabled)
      let baseReply = `✨ Based on your selected skills and message, here are some top matches.${explicitNewTopics.length ? `\n💡 I also considered: ${explicitNewTopics.join(", ")}.` : ""}`;

      // generate quickReplies: general follow-ups + item-specific + switch suggestions
      const quickReplies = [
        "Tell me more",
        "How long does this take?",
        "Is this for beginners?",
        "Show me more"
      ];

      // add item-specific quick replies: "Tell me about #1"
      topCourses.forEach((c, i) => {
        quickReplies.push(`Tell me about #${i + 1}`);
      });

      // add switch suggestions if any
      proposeSwitchQuickReplies.forEach(s => quickReplies.push(s));

      // optional LLM polish - include a small history snippet
      let finalReply = baseReply;
      if (process.env.USE_LLM === "true") {
        const enriched = await enrichReply(message, searchTags, topCourses, "recommend", memory.history);
        if (enriched) finalReply = enriched;
      }

      return res.json({
        reply: finalReply,
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
      // optionally LLM suggest alternatives
      if (process.env.USE_LLM === "true") {
        const suggestion = await enrichReply(message, searchTags, [], "recommend", memory.history);
        if (suggestion) return res.json({ reply: suggestion, courses: [], quickReplies: ["Try 'AI'", "Try 'coding'"] });
      }
      return res.json({ reply: `Couldn't find good matches for ${searchTags.join(", ")}. Try adding or changing skills/interests.`, courses: [] });
    }
  } catch (err) {
    console.error("recommend error:", err);
    return res.json({ reply: " Something went wrong. Try again or check server logs.", courses: [] });
  }
});

module.exports = router;
