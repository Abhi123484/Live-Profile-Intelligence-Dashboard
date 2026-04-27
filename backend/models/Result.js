const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  domain: { type: String, required: true },
  score: { type: Number, required: true },
  attemptedAt: { type: Date, default: Date.now },
  answers: [Number]
});

module.exports = mongoose.model('Result', resultSchema);
