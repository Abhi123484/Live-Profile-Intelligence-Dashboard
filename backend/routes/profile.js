const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Domain = require('../models/Domain');
const ActivityLog = require('../models/ActivityLog');
const { updateScore } = require('../services/scoreEngine');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_123');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get Profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fullName, location, gender, birthdate, phone, bio, skills, education, links, photoUrl } = req.body;

    if (skills && skills.length > 0) {
      const existingDomains = await Domain.find({ name: { $in: skills } });
      if (existingDomains.length !== skills.length) {
        return res.status(400).json({ message: 'One or more selected skills are not valid.' });
      }
    }
    
    // Calculate completion percentage (10 fields, 10% each)
    let completeness = 0;
    if (fullName) completeness += 10;
    if (location) completeness += 10;
    if (gender) completeness += 10;
    if (birthdate) completeness += 10;
    if (phone) completeness += 10;
    if (bio) completeness += 10;
    if (skills && skills.length > 0) completeness += 15;
    if (education && education.length > 0) completeness += 10;
    if (photoUrl) completeness += 10;
    if (links && (links.github || links.linkedin || links.portfolio)) completeness += 5;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { fullName, location, gender, birthdate, phone, bio, skills, education, links, photoUrl, completionPct: completeness },
      { upsert: true, new: true }
    );

    // Log activity
    const activity = new ActivityLog({ userId: req.userId, action: 'profile_update' });
    await activity.save();

    // Update Score and trigger Socket.io event
    const io = req.app.get('io');
    await updateScore(req.userId, io);

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
