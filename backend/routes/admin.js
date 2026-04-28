const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Domain = require('../models/Domain');
const Question = require('../models/Question');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Result = require('../models/Result');
const ActivityLog = require('../models/ActivityLog');
const Badge = require('../models/Badge');
const Score = require('../models/Score');

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// ==================== DASHBOARD STATS ====================
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalDomains, totalQuestions] = await Promise.all([
      User.countDocuments(),
      Domain.countDocuments(),
      Question.countDocuments()
    ]);
    res.json({ totalUsers, totalDomains, totalQuestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt role').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Delete associated data
    await Profile.findOneAndDelete({ userId });
    await Result.deleteMany({ userId });
    await ActivityLog.deleteMany({ userId });
    await Badge.deleteMany({ userId });
    await Score.findOneAndDelete({ userId });

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User and associated data deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== DOMAIN CRUD ====================

// Add domain
router.post('/domains', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Domain name is required.' });

    const existing = await Domain.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ message: 'Domain already exists.' });

    const domain = new Domain({ name, description });
    await domain.save();
    res.status(201).json(domain);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all domains
router.get('/domains', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete domain (also deletes associated questions)
router.delete('/domains/:id', async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });

    await Question.deleteMany({ domainId: req.params.id });
    await Domain.findByIdAndDelete(req.params.id);
    res.json({ message: 'Domain and associated questions deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== QUESTION CRUD ====================

// Add question
router.post('/questions', async (req, res) => {
  try {
    const { domainId, question, options, correctAnswer, difficulty } = req.body;

    if (!domainId || !question || !options || correctAnswer === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Exactly 4 options are required.' });
    }
    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: 'correctAnswer must be 0-3.' });
    }

    const domain = await Domain.findById(domainId);
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });

    const q = new Question({ domainId, question, options, correctAnswer, difficulty });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get questions (with optional domain filter)
router.get('/questions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.domainId) filter.domainId = req.query.domainId;

    const questions = await Question.find(filter)
      .populate('domainId', 'name')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update question
router.put('/questions/:id', async (req, res) => {
  try {
    const { domainId, question, options, correctAnswer, difficulty } = req.body;

    if (options && (!Array.isArray(options) || options.length !== 4)) {
      return res.status(400).json({ message: 'Exactly 4 options are required.' });
    }
    if (correctAnswer !== undefined && (correctAnswer < 0 || correctAnswer > 3)) {
      return res.status(400).json({ message: 'correctAnswer must be 0-3.' });
    }

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { domainId, question, options, correctAnswer, difficulty },
      { new: true, runValidators: true }
    ).populate('domainId', 'name');

    if (!updated) return res.status(404).json({ message: 'Question not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete question
router.delete('/questions/:id', async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Question not found.' });
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
