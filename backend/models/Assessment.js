const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  questions: [{
    text: String,
    options: [String],
    correct: Number // index of correct option
  }]
});

module.exports = mongoose.model('Assessment', assessmentSchema);
