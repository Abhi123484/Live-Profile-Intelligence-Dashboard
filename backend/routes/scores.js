const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

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

// Get current user score
router.get('/my-score', authMiddleware, async (req, res) => {
  try {
    const score = await Score.findOne({ userId: req.userId });
    res.json(score || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get public profile and score
router.get('/public/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const profile = await Profile.findOne({ userId: req.params.userId });
    const score = await Score.findOne({ userId: req.params.userId });
    
    res.json({
      user,
      profile: profile || {},
      score: score || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
