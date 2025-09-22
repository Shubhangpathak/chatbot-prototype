const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const recommendRoutes = require('./routes/recommend');

// Load environment variables from server/.env or repo root .env
(() => {
  const candidatePaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env')
  ];
  const found = candidatePaths.find(p => {
    try { return fs.existsSync(p); } catch { return false; }
  });
  if (found) {
    require('dotenv').config({ path: found });
  } else {
    require('dotenv').config();
  }
})();

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('Missing MONGO_URL in environment. Create a .env with MONGO_URL=...');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Mount chat/reco route
app.use('/api', recommendRoutes);

const PORT = process.env.PORT || 3001;

// Connect to MongoDB first, then start server
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err.message || err);
    process.exit(1);
  });
