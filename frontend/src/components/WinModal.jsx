import { useEffect, useRef, useState } from 'react';
import { submitScore } from '../api/client.js';

function formatTime(ms) {
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${m}m ${s}s`;
}

export default function WinModal({ timeMs, mode, difficulty, date, onPlayAgain, onScoreSubmitted }) {
  const [name, setName]         = useState('');
  const [submitted, setSubmit]  = useState(false);
  const [submitting, setSending] = useState(false);
  const [error, setError]       = useState(null);
  const confettiRef             = useRef(null);
  const rafRef                  = useRef(null);

  // Confetti
  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const COLORS = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#38bdf8','#a78bfa','#f472b6'];
    const particles = Array.from({ length: 160 }, () => ({
      x:     Math.random() * canvas.width,
      y:     -30 - Math.random() * canvas.height * 0.4,
      vx:    (Math.random() - 0.5) * 5,
      vy:    2.5 + Math.random() * 4.5,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.18,
      w:     7 + Math.random() * 11,
      h:     4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
    }));

    const deadline = performance.now() + 4200;
    const frame = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const remaining = deadline - now;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.08;
        if (remaining < 1000) p.alpha = Math.max(0, remaining / 1000);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (now < deadline) rafRef.current = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSending(true);
    setError(null);
    try {
      await submitScore({ name: name.trim(), timeMs, difficulty, date });
      setSubmit(true);
      onScoreSubmitted?.();
    } catch {
      setError('Could not submit score. Try again?');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <canvas ref={confettiRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 199 }} />
      <div style={styles.overlay}>
        <div style={styles.box}>
          <div style={styles.stars}>🌟⭐🌟</div>
          <h2 style={styles.heading}>You did it!</h2>

          {mode === 'daily' && (
            <p style={styles.time}>Solved in <strong>{formatTime(timeMs)}</strong></p>
          )}

          {mode === 'daily' && !submitted && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Your name"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
              <button style={styles.btnSubmit} disabled={submitting || !name.trim()}>
                {submitting ? 'Saving…' : '🏆 Submit Score'}
              </button>
              {error && <p style={styles.error}>{error}</p>}
            </form>
          )}

          {mode === 'daily' && submitted && (
            <p style={styles.success}>Score saved! 🎉</p>
          )}

          <button style={styles.btnPlay} onClick={onPlayAgain}>
            🎲 Play Again!
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(79,46,179,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box:       { background: '#fff', borderRadius: 28, padding: '44px 52px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', maxWidth: 'min(92vw, 420px)', animation: 'popIn 0.55s cubic-bezier(0.175,0.885,0.32,1.4) both' },
  stars:     { fontSize: '2.4em', marginBottom: 10 },
  heading:   { fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.8em,5vw,2.8em)', color: '#7c3aed', marginBottom: 6 },
  time:      { fontSize: '1.05em', color: '#555', fontWeight: 700, marginBottom: 20 },
  form:      { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  input:     { padding: '11px 16px', borderRadius: 50, border: '2px solid #e5e7eb', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1em', outline: 'none', textAlign: 'center' },
  btnSubmit: { padding: '11px 28px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#7c3aed', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1em', boxShadow: '0 4px 0 #5b21b6' },
  btnPlay:   { padding: '13px 38px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#22c55e', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.05em', boxShadow: '0 5px 0 #15803d', marginTop: 8 },
  success:   { color: '#16a34a', fontWeight: 800, marginBottom: 8 },
  error:     { color: '#ef4444', fontSize: '0.85em', fontWeight: 700 },
};