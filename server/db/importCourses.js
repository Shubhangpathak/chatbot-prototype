const csv = require('csvtojson');
const mongoose = require('mongoose');
const Course = require('../models/course');

mongoose.connect('mongodb+srv://shubhangpathak:HHgg53bpVPI4CcgY@cluster0.iy54w.mongodb.net/chatbot-proto');

csv()
  .fromFile(__dirname + '/Hackathon_Courses_Dataset.csv')
  .then(async (courses) => {
    // Clean and normalize tags/skills
    const formatted = courses.map(c => ({
      ...c,
      skills: c.skills ? c.skills.split(',').map(s => s.trim()) : [],
      tags: c.tags ? c.tags.split(';').map(t => t.trim()) : [],
      career_paths: c.career_paths ? c.career_paths.split(';').map(p => p.trim()) : [],

      // Safely parse numbers
      price: c.price && !isNaN(c.price) ? Number(c.price) : 0,
      rating: c.rating && !isNaN(c.rating) ? Number(c.rating) : 0,
      num_reviews: c.num_reviews && !isNaN(c.num_reviews) ? Number(c.num_reviews) : 0,
      num_subscribers: c.num_subscribers && !isNaN(c.num_subscribers) ? Number(c.num_subscribers) : 0,
    }));

    await Course.deleteMany(); // Clear old
    await Course.insertMany(formatted);
    console.log('✅ Courses imported:', formatted.length);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("❌ Import failed:", err);
    mongoose.disconnect();
  });
// i wanna learn coading it recommends me but it cant recommend me when i say i wanna learn it