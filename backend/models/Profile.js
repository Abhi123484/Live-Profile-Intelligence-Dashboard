const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String },
  location: { type: String },
  gender: { type: String },
  birthdate: { type: String },
  phone: { type: String },
  bio: { type: String },
  skills: { type: [String] },
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  links: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  photoUrl: { type: String },
  completionPct: { type: Number, default: 0 }
});

module.exports = mongoose.model('Profile', profileSchema);
