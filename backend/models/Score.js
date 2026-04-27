const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalScore: { type: Number, default: 0 }, // 0 - 1000
  profileScore: { type: Number, default: 0 },
  assessmentScore: { type: Number, default: 0 },
  activityScore: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' }, // Bronze, Silver, Gold, Platinum
  xp: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
