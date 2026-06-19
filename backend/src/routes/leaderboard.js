'use strict';

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /leaderboard?difficulty=medium&date=2026-06-19
router.get('/', async (req, res) => {
  const difficulty = req.query.difficulty || 'medium';
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const scores = await prisma.score.findMany({
    where: { difficulty, date },
    orderBy: { timeMs: 'asc' },
    take: 10,
    select: { id: true, name: true, timeMs: true, createdAt: true },
  });

  res.json(scores);
});

// POST /leaderboard  { name, timeMs, difficulty, date }
router.post('/', async (req, res) => {
  const { name, timeMs, difficulty, date } = req.body;

  if (!name || !timeMs || !difficulty) {
    return res.status(400).json({ error: 'name, timeMs, and difficulty are required' });
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'invalid difficulty' });
  }

  const score = await prisma.score.create({
    data: {
      name: String(name).trim().slice(0, 20),
      timeMs: Math.max(1, parseInt(timeMs, 10)),
      difficulty,
      date: date || new Date().toISOString().split('T')[0],
    },
  });

  res.status(201).json(score);
});

module.exports = router;