const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Badge = require('../models/Badge');
const { BADGE_TYPES } = require('../services/scoreEngine');

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

// Get all badges for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const badges = await Badge.find({ userId: req.userId }).sort({ unlockedAt: -1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all possible badge types (for display)
router.get('/types', authMiddleware, async (req, res) => {
  try {
    const userBadges = await Badge.find({ userId: req.userId });
    const unlockedTypes = userBadges.map(b => b.badgeType);

    const allBadges = Object.values(BADGE_TYPES).map(type => ({
      badgeType: type,
      unlocked: unlockedTypes.includes(type),
      unlockedAt: userBadges.find(b => b.badgeType === type)?.unlockedAt || null
    }));

    res.json(allBadges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
