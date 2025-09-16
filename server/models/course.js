const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_id: Number,
  course_title: String,
  provider: String,
  category: String,
  subcategory: String,
  skills: [String],
  tags: [String],
  level: String,
  price: Number,
  url: String,
  career_paths: [String],
  rating: Number,
  num_reviews: Number,
  num_subscribers: Number,
});

module.exports = mongoose.model('Course', courseSchema);
