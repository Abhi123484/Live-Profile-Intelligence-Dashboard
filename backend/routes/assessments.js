const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Assessment = require('../models/Assessment');
const Result = require('../models/Result');
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

// Get all assessments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assessments = await Assessment.find({}, { 'questions.correct': 0 }); // Hide correct index
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate assessment from admin-uploaded questions for a domain
router.get('/generate', authMiddleware, async (req, res) => {
  try {
    const domainId = req.query.domainId;
    if (!domainId) return res.status(400).json({ message: 'DomainId is required.' });

    const Question = require('../models/Question');
    const Domain = require('../models/Domain');
    const Result = require('../models/Result');
    const domain = await Domain.findById(domainId);
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });

    // Check if user has already taken quiz for this domain today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingResult = await Result.findOne({
      userId: req.userId,
      domain: domain.name,
      attemptedAt: { $gte: today, $lt: tomorrow }
    });

    if (existingResult) {
      return res.status(409).json({ message: 'You have already taken the quiz for this domain today.', result: existingResult });
    }

    const questions = await Question.find({ domainId });
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions available for this domain.' });
    }

    const groupByDifficulty = { easy: [], medium: [], hard: [] };
    questions.forEach((q) => {
      const key = q.difficulty || 'medium';
      if (!groupByDifficulty[key]) groupByDifficulty[key] = [];
      groupByDifficulty[key].push(q);
    });

    const pickRandom = (items, count) => {
      const copy = [...items];
      const picked = [];
      while (picked.length < count && copy.length > 0) {
        const index = Math.floor(Math.random() * copy.length);
        picked.push(copy.splice(index, 1)[0]);
      }
      return picked;
    };

    const required = { easy: 4, medium: 3, hard: 3 };
    let selected = [];
    Object.entries(required).forEach(([level, count]) => {
      const available = groupByDifficulty[level] || [];
      selected = selected.concat(pickRandom(available, count));
    });

    const remainingPool = questions.filter(q => !selected.some(s => s._id.equals(q._id)));
    while (selected.length < 10 && remainingPool.length > 0) {
      const index = Math.floor(Math.random() * remainingPool.length);
      selected.push(remainingPool.splice(index, 1)[0]);
    }

    if (selected.length < 10) {
      return res.status(400).json({ message: 'Not enough questions to generate a full assessment for this domain.' });
    }

    const assessment = new Assessment({
      title: `Daily Quiz: ${domain.name}`,
      domain: domain.name,
      questions: selected.map((q) => ({ text: q.question, options: q.options, correct: q.correctAnswer }))
    });
    await assessment.save();

    const response = assessment.toObject();
    response.questions = response.questions.map((q) => ({ text: q.text, options: q.options }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit assessment
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const userAnswers = req.body.answers; // Array of indices
    let correctCount = 0;
    assessment.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correct) {
        correctCount++;
      }
    });

    const score = (correctCount / assessment.questions.length) * 100;

    const result = new Result({
      userId: req.userId,
      assessmentId: assessment._id,
      domain: assessment.domain,
      score,
      answers: userAnswers
    });
    await result.save();

    // Log activity
    const activity = new ActivityLog({ userId: req.userId, action: `assessment_complete_${assessment.domain}` });
    await activity.save();

    // Update Score and trigger Socket.io event
    const io = req.app.get('io');
    await updateScore(req.userId, io);

    res.json({ score, correctCount, total: assessment.questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's result for a domain
router.get('/result/:domain', authMiddleware, async (req, res) => {
  try {
    const domain = req.params.domain;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await Result.findOne({
      userId: req.userId,
      domain,
      attemptedAt: { $gte: today, $lt: tomorrow }
    }).populate('assessmentId');

    if (!result) return res.status(404).json({ message: 'No result found for today.' });

    res.json({
      score: result.score,
      correctCount: Math.round((result.score / 100) * 10), // Assuming 10 questions
      total: 10,
      domain: result.domain,
      attemptedAt: result.attemptedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
