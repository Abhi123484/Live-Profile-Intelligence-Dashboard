const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', required: true },
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: {
      validator: function (v) { return v.length === 4; },
      message: 'Exactly 4 options are required.'
    },
    required: true
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
