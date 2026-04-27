const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

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

// Get activity log for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await ActivityLog.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get activity heatmap data for last 12 months
router.get('/heatmap/data', authMiddleware, async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const activities = await ActivityLog.find({
      userId: req.userId,
      timestamp: { $gte: twelveMonthsAgo }
    });

    // Aggregate by date
    const heatmapData = {};
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get public user activity heatmap data
router.get('/heatmap/public/:userId', async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const activities = await ActivityLog.find({
      userId: req.params.userId,
      timestamp: { $gte: twelveMonthsAgo }
    });

    // Aggregate by date
    const heatmapData = {};
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
