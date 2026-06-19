'use strict';

const express = require('express');
const cors = require('cors');
const mazeRoutes = require('./routes/maze');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/maze', mazeRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));