import { useCallback, useRef, useState } from 'react';
import MazeCanvas from './components/MazeCanvas.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import WinModal from './components/WinModal.jsx';
import { generateMaze } from './utils/mazeGenerator.js';
import { getDailyMaze } from './api/client.js';

const LEVELS = {
  easy:   { rows: 9,  cols: 9  },
  medium: { rows: 13, cols: 13 },
  hard:   { rows: 19, cols: 19 },
};

function buildFreePlayMaze(difficulty) {
  const { rows, cols } = LEVELS[difficulty];
  return { grid: generateMaze(rows, cols), rows, cols, date: null };
}

export default function App() {
  const [mode,         setMode]         = useState('freeplay'); // 'freeplay' | 'daily'
  const [difficulty,   setDifficulty]   = useState('easy');
  const [mazeData,     setMazeData]     = useState(() => buildFreePlayMaze('easy'));
  const [loading,      setLoading]      = useState(false);
  const [winTime,      setWinTime]      = useState(null);      // ms, null = not won
  const [lbRefresh,    setLbRefresh]    = useState(0);         // increment to re-fetch leaderboard
  const [apiError,     setApiError]     = useState(null);

  const mazeRef = useRef(null);

  // ── Load a new maze based on current mode ──────────────────────────────────
  const loadMaze = useCallback(async (nextMode, nextDiff) => {
    const m = nextMode  ?? mode;
    const d = nextDiff  ?? difficulty;
    setWinTime(null);
    setApiError(null);

    if (m === 'freeplay') {
      setMazeData(buildFreePlayMaze(d));
    } else {
      setLoading(true);
      try {
        const data = await getDailyMaze(d);
        setMazeData(data);
      } catch {
        setApiError('Could not reach the server. Playing offline.');
        setMazeData(buildFreePlayMaze(d));
      } finally {
        setLoading(false);
      }
    }
  }, [mode, difficulty]);

  const handleModeChange = (m) => {
    setMode(m);
    loadMaze(m, difficulty);
  };

  const handleDiffChange = (d) => {
    setDifficulty(d);
    loadMaze(mode, d);
  };

  const handleWin = (timeMs) => setWinTime(timeMs);

  const handlePlayAgain = () => {
    setWinTime(null);
    loadMaze();
  };

  const handleScoreSubmitted = () => setLbRefresh(n => n + 1);

  const handleClear = () => mazeRef.current?.clear();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.15) rotate(-8deg); opacity: 0; }
          to   { transform: scale(1)    rotate(0deg);  opacity: 1; }
        }
      `}</style>

      <h1 style={styles.title}>🌟 Maze Adventure!</h1>

      {/* Mode tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(mode === 'freeplay' ? styles.tabActive : {}) }} onClick={() => handleModeChange('freeplay')}>
          🎮 Free Play
        </button>
        <button style={{ ...styles.tab, ...(mode === 'daily' ? styles.tabActive : {}) }} onClick={() => handleModeChange('daily')}>
          📅 Daily Challenge
        </button>
      </div>

      {/* Difficulty */}
      <div style={styles.controls}>
        {['easy', 'medium', 'hard'].map(d => (
          <button
            key={d}
            style={{ ...styles.btn, ...styles.btnDiff, ...(difficulty === d ? styles.btnDiffActive : {}) }}
            onClick={() => handleDiffChange(d)}
          >
            {d === 'easy' ? '🐣' : d === 'medium' ? '🦊' : '🐉'} {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button style={{ ...styles.btn, ...styles.btnNew }} onClick={() => loadMaze()}>🎲 New Maze</button>
        {mode === 'freeplay' && (
          <button style={{ ...styles.btn, ...styles.btnClear }} onClick={handleClear}>🧹 Clear</button>
        )}
      </div>

      {apiError && <p style={styles.apiError}>{apiError}</p>}

      <div style={styles.layout}>
        {/* Maze card */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loadingBox}>⏳ Loading today&apos;s maze…</div>
          ) : (
            <MazeCanvas
              ref={mazeRef}
              grid={mazeData.grid}
              rows={mazeData.rows}
              cols={mazeData.cols}
              onWin={handleWin}
            />
          )}

          <div style={styles.legend}>
            {[['#4ade80', 'Start (S)'], ['#fbbf24', 'Finish (F)'], ['rgba(99,179,237,0.75)', 'Your path']].map(([color, label]) => (
              <div key={label} style={styles.legendItem}>
                <div style={{ ...styles.swatch, background: color }} />
                {label}
              </div>
            ))}
          </div>
          <p style={styles.hint}>Click &amp; drag from <strong>S</strong> to find the way to <strong>F</strong>!</p>
        </div>

        {/* Leaderboard — daily mode only */}
        {mode === 'daily' && mazeData.date && (
          <Leaderboard
            difficulty={difficulty}
            date={mazeData.date}
            refreshToken={lbRefresh}
          />
        )}
      </div>

      {/* Win modal */}
      {winTime !== null && (
        <WinModal
          timeMs={winTime}
          mode={mode}
          difficulty={difficulty}
          date={mazeData.date}
          onPlayAgain={handlePlayAgain}
          onScoreSubmitted={handleScoreSubmitted}
        />
      )}
    </div>
  );
}

const styles = {
  page:        { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 48px', minHeight: '100vh', overflowX: 'hidden' },
  title:       { fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2em,7vw,3.6em)', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.25)', marginBottom: 18, letterSpacing: 1, textAlign: 'center' },
  tabs:        { display: 'flex', gap: 8, marginBottom: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: 4 },
  tab:         { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.9em', padding: '8px 20px', border: 'none', borderRadius: 50, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.75)', transition: 'all 0.15s' },
  tabActive:   { background: '#fff', color: '#5b21b6' },
  controls:    { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 22 },
  btn:         { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 'clamp(0.78em,2.4vw,1em)', padding: '10px 22px', border: 'none', borderRadius: 50, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDiff:     { background: 'rgba(255,255,255,0.92)', color: '#5b21b6', boxShadow: '0 5px 0 rgba(0,0,0,0.18)' },
  btnDiffActive: { background: '#fbbf24', color: '#fff', boxShadow: '0 5px 0 #b45309' },
  btnNew:      { background: '#22c55e', color: '#fff', boxShadow: '0 5px 0 #15803d' },
  btnClear:    { background: '#fb923c', color: '#fff', boxShadow: '0 5px 0 #c2410c' },
  apiError:    { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '0.85em', padding: '6px 18px', borderRadius: 50, marginBottom: 12 },
  layout:      { display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'flex-start', maxWidth: 900, width: '100%' },
  card:        { background: '#fff', borderRadius: 24, padding: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 5px rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 'calc(100vw - 32px)' },
  loadingBox:  { padding: 40, fontWeight: 800, color: '#7c3aed', fontSize: '1.1em' },
  legend:      { display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  legendItem:  { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82em', fontWeight: 700, color: '#555' },
  swatch:      { width: 18, height: 18, borderRadius: 5, flexShrink: 0 },
  hint:        { fontSize: '0.82em', color: '#888', fontWeight: 700, textAlign: 'center' },
};