// server/nlp/parser.js
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const levenshtein = natural.LevenshteinDistance;

const TAGS = [
  "ai", "machine learning", "deep learning", "coding", "development",
  "design", "ui", "ux", "graphic design", "marketing",
  "business", "data science", "analytics", "blockchain",
  "healthcare", "education", "engineering", "arts"
];

const SYNONYMS = {
  "artificial intelligence": "ai",
  "ai/ml": "machine learning",
  "aiml": "machine learning",
  "ml": "machine learning",
  "dl": "deep learning",
  "programming": "coding",
  "programmer": "coding",
  "dev": "development",
  "frontend": "development",
  "backend": "development",
  "analysis": "data science",
  "stats": "data science",
  "ux": "design",
  "ui": "design",
  "ds": "data science",
  "crypto": "blockchain",
  "web3": "blockchain"
};

const RELATED_TAGS = {
  ai: ["machine learning", "deep learning"],
  "machine learning": ["ai", "deep learning", "data science"],
  "deep learning": ["ai", "machine learning"],
  coding: ["development", "programming"],
  development: ["coding", "engineering"],
  design: ["ui", "ux", "graphic design"],
  business: ["marketing"],
  "data science": ["analytics", "ai"],
  blockchain: ["crypto", "web3"]
};

// conversational detection lists
const GREETINGS = ["hi", "hello", "hey", "yo", "sup"];
const SMALLTALK = ["how are you", "who are you", "what can you do", "help"];
const FAREWELL = ["thanks", "thank you", "bye", "goodbye", "see you", "later"];
const META = ["follow up", "follow-up", "can i ask", "how does this work", "what can you do"];
const RESET = ["reset", "start over", "new topic", "clear"];
const QUESTION = ["time", "duration", "long", "hours", "cost", "price", "level", "difficulty", "beginner", "advanced"];
// normalize a single word/phrase to a known tag (returns normalized tag or null)
function normalizeWord(word) {
  if (!word || typeof word !== "string") return null;
  word = word.toLowerCase().trim();

  // direct synonyms
  if (SYNONYMS[word]) return SYNONYMS[word];

  // direct tag
  if (TAGS.includes(word)) return word;

  // fuzzy match to tags
  let bestMatch = null;
  let bestDist = Infinity;
  for (let tag of TAGS) {
    const dist = levenshtein(word, tag);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestMatch = tag;
    }
  }

  // fuzzy match synonyms
  for (let key in SYNONYMS) {
    const dist = levenshtein(word, key);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestMatch = SYNONYMS[key];
    }
  }

  return bestMatch;
}

// extract tags from free text (tokenizes + normalizes + expands)
function extractTags(message) {
  if (!message || typeof message !== "string") return [];
  const words = tokenizer.tokenize(message.toLowerCase());
  let matched = [];

  // check multi-word phrases first
  const lower = message.toLowerCase();
  for (let key in SYNONYMS) {
    if (lower.includes(key)) matched.push(SYNONYMS[key]);
  }

  // token-level normalization
  for (let w of words) {
    const norm = normalizeWord(w);
    if (norm) matched.push(norm);
  }

  // expand with related tags
  let expanded = [...matched];
  for (let t of matched) {
    if (RELATED_TAGS[t]) expanded = expanded.concat(RELATED_TAGS[t]);
  }

  // deduplicate
  return [...new Set(expanded)];
}

function detectIntent(message) {
  const text = message.toLowerCase();

  // --- Question related keywords ---
  const QUESTION = [
    "beginner", "advanced", "intermediate", "level",
    "duration", "time", "how long",
    "price", "cost", "fees"
  ];
  if (QUESTION.some(q => text.includes(q))) return "question";

  // --- Strong recommend signals ---
  if (
    text.includes("course") ||
    text.includes("courses") ||
    text.includes("learn") ||
    text.includes("study") ||
    text.includes("explore")
  ) {
    return "recommend";
  }

  // --- Greetings ---
  const GREETINGS = ["hi", "hello", "hey", "yo", "sup"];
  if (GREETINGS.some(g => text.includes(g))) return "greeting";

  // --- Smalltalk ---
  const SMALLTALK = ["how are you", "who are you", "what can you do", "help"];
  if (SMALLTALK.some(s => text.includes(s))) return "smalltalk";

  // --- Farewell ---
  const FAREWELL = ["thanks", "thank you", "bye", "goodbye", "see you", "later"];
  if (FAREWELL.some(f => text.includes(f))) return "farewell";

  // --- Meta / reset ---
  const META = ["follow up", "follow-up", "can i ask", "how does this work", "what can you do"];
  const RESET = ["reset", "start over", "new topic", "clear"];
  if (META.some(m => text.includes(m))) return "meta";
  if (RESET.some(r => text.includes(r))) return "reset";

  // --- Fuzzy recommend variations ---
  const recommendWords = ["recommend", "recomend", "reccomend", "suggest", "advise"];
  for (let word of recommendWords) {
    if (text.includes(word)) return "recommend";
  }

  return "chat"; // fallback
}


module.exports = { extractTags, detectIntent, normalizeWord };
