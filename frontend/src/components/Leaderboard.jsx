import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/client.js';

function formatTime(ms) {
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${m}m ${s}s`;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ difficulty, date, refreshToken }) {
  const [scores, setScores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getLeaderboard(difficulty, date)
      .then(setScores)
      .catch(() => setError('Could not load scores'))
      .finally(() => setLoading(false));
  }, [difficulty, date, refreshToken]);

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>🏆 Today&apos;s Top 10</h3>
      <p style={styles.sub}>{difficulty} · {date}</p>

      {loading && <p style={styles.msg}>Loading…</p>}
      {error   && <p style={{ ...styles.msg, color: '#f87171' }}>{error}</p>}

      {!loading && !error && scores.length === 0 && (
        <p style={styles.msg}>No scores yet — be the first!</p>
      )}

      {!loading && !error && scores.length > 0 && (
        <ol style={styles.list}>
          {scores.map((s, i) => (
            <li key={s.id} style={{ ...styles.item, background: i === 0 ? '#fef9c3' : '#f9f7ff' }}>
              <span style={styles.rank}>{MEDALS[i] ?? `#${i + 1}`}</span>
              <span style={styles.name}>{s.name}</span>
              <span style={styles.time}>{formatTime(s.timeMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const styles = {
  wrap:    { background: '#fff', borderRadius: 20, padding: '18px 20px', minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  heading: { fontFamily: "'Fredoka One', cursive", fontSize: '1.3em', color: '#5b21b6', marginBottom: 2 },
  sub:     { fontSize: '0.78em', color: '#aaa', fontWeight: 700, marginBottom: 12, textTransform: 'capitalize' },
  msg:     { fontSize: '0.85em', color: '#888', fontWeight: 700, textAlign: 'center', padding: '12px 0' },
  list:    { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  item:    { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10 },
  rank:    { fontSize: '1.1em', width: 28, textAlign: 'center', flexShrink: 0 },
  name:    { flex: 1, fontWeight: 800, fontSize: '0.9em', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  time:    { fontWeight: 800, fontSize: '0.9em', color: '#7c3aed', flexShrink: 0 },
};