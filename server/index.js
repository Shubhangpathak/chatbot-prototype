const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const recommendRoutes = require('./routes/recommend');
mongoose.connect('mongodb+srv://shubhangpathak:HHgg53bpVPI4CcgY@cluster0.iy54w.mongodb.net/chatbot-proto');
const app = express();
app.use(cors());
app.use(express.json());

// Mount chat/reco route
app.use('/api', recommendRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Shubhang port is running on port ${PORT}`));
