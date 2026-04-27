const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

// Public domain list for frontend user skill selection
router.get('/', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
