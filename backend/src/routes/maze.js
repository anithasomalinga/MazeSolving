'use strict';

const express = require('express');
const { generateMaze, dateToSeed } = require('../services/mazeGenerator');

const router = express.Router();

const DIFFICULTY = {
  easy:   { rows: 9,  cols: 9,  offset: 0 },
  medium: { rows: 13, cols: 13, offset: 1 },
  hard:   { rows: 19, cols: 19, offset: 2 },
};

// GET /maze/daily?difficulty=medium
router.get('/daily', (req, res) => {
  const difficulty = DIFFICULTY[req.query.difficulty] ? req.query.difficulty : 'medium';
  const { rows, cols, offset } = DIFFICULTY[difficulty];
  const today = new Date().toISOString().split('T')[0];
  const seed = dateToSeed(today) + offset;
  const grid = generateMaze(rows, cols, seed);
  res.json({ date: today, difficulty, rows, cols, seed, grid });
});

module.exports = router;