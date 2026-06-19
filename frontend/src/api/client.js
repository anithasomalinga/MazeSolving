const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getDailyMaze(difficulty = 'medium') {
  const res = await fetch(`${BASE}/maze/daily?difficulty=${difficulty}`);
  if (!res.ok) throw new Error('Failed to fetch daily maze');
  return res.json();
}

export async function getLeaderboard(difficulty = 'medium', date) {
  const params = new URLSearchParams({ difficulty });
  if (date) params.set('date', date);
  const res = await fetch(`${BASE}/leaderboard?${params}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function submitScore({ name, timeMs, difficulty, date }) {
  const res = await fetch(`${BASE}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, timeMs, difficulty, date }),
  });
  if (!res.ok) throw new Error('Failed to submit score');
  return res.json();
}