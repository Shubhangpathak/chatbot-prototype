## MENTORA — One‑Stop Personalized Career Educational Advisor

Mentora is a full‑stack web app that helps students explore personalized learning paths and courses using an AI‑assisted recommender backed by a curated courses dataset. Built for Smart India Hackathon 2025 by Team Code Crafters (Team ID: MITADTSW372) under the Smart Education theme (Problem Statement: SIH25094).

### Purpose of the Hackathon Project
- **Problem**: Students face scattered resources, generic guidance, and decision fatigue when selecting courses/careers.
- **Goal**: Provide a single, easy interface that recommends relevant courses and next steps based on interests, skills, and goals.
- **Outcome**: Faster, informed decisions with explainable recommendations and a clean UX.

---

### Tech Stack
- **Frontend**: React + Vite (client/)
- **Backend**: Node.js + Express (server/)
- **Database/Storage**: CSV dataset imported into in‑app model layer
- **NLP**: Lightweight parser for extracting intents/entities from user prompts (server/nlp/)

---

### Project Structure
```
hackathon-chatbot/
  client/           # React app (Vite)
    src/            # Pages, components
  server/           # Express API
    routes/         # REST endpoints (e.g., recommendations)
    models/         # Course model
    db/             # Dataset + import scripts
    nlp/            # Query parser
```

---

### Quickstart
Prerequisites: Node 18+ and npm.

1) Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

2) Seed/import dataset (optional if already present)
```bash
cd server
npm run import            # runs db/importCourses.js
```

3) Run both apps (two terminals)
```bash
# terminal 1
cd server
npm start                 # starts Express API on its configured port

# terminal 2
cd client
npm run dev               # starts Vite dev server
```

4) Open the app
- Visit the printed Vite URL (typically `http://localhost:5173`).

Environment variables (if any) can be added later as needed. The default setup works locally without extra configuration.

---

### Core Workflow (Short)
1. **User Enters Query**: The user describes interests or a goal on the React UI (e.g., “I like data and math, want AI roles”).
2. **NLP Parsing**: The backend `nlp/parser.js` extracts intents, keywords, and constraints (skill, domain, level).
3. **Recommendation Engine**: The API consults the `Course` model and dataset to filter and score courses by relevance.
4. **Response and Rationale**: The API returns ranked courses and a succinct explanation of why they’re relevant.
5. **UI Presentation**: The client renders cards and guides (e.g., skills to build, next steps, teachers’ guides) for quick action.

---

### Notable Directories & Files
- `client/src/pages/` — Pages like `Home.jsx`, `Dashboard.jsx`, `Login.jsx`, etc.
- `client/src/components/Navbar.jsx` — Top‑level navigation.
- `server/routes/recommend.js` — Recommendation endpoint(s).
- `server/models/course.js` — Course schema/model utilities.
- `server/db/Hackathon_Courses_Dataset.csv` — Dataset used for recommendations.
- `server/db/importCourses.js` — Script to import/prepare dataset.
- `server/nlp/parser.js` — Lightweight natural language parser.

---

### API (Glance)
- `GET /health` (if present) — Service health.
- `POST /recommend` — Body: `{ query: string, preferences?: object }` → returns ranked courses and reasons.

---

### Roadmap Ideas
- Enrich dataset (provider, duration, skill outcomes, difficulty).
- Add user profiles and progress tracking.
- Improve NLP with embeddings for semantic matching.
- Explainability: highlight which query parts matched which course features.

---

### License
This project is for hackathon/educational use. Add an OSS license if you plan to open source.


