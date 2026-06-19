import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const PALETTE = {
  bg:       '#fdf6ff',
  wall:     '#2d1f6e',
  start:    '#4ade80',
  finish:   '#fbbf24',
  pathFill: 'rgba(99, 179, 237, 0.40)',
  pathLine: 'rgba(49, 130, 206, 0.65)',
  label:    '#ffffff',
};

function fillRoundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  ctx.fill();
}

const MazeCanvas = forwardRef(function MazeCanvas({ grid, rows, cols, onWin }, ref) {
  const canvasRef  = useRef(null);
  const onWinRef   = useRef(onWin);
  const clearRef   = useRef(null);
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);

  useImperativeHandle(ref, () => ({
    clear: () => clearRef.current?.(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;

    // Mutable game state — kept as plain vars so all closures share the same bindings
    let path      = [];
    let isDrawing = false;
    let won       = false;
    let startTime = null;
    let cellSize  = 40;

    const computeSize = () => {
      const avail = Math.min(window.innerWidth - 80, 580);
      cellSize = Math.max(Math.floor(avail / cols), 22);
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const cs  = cellSize;

      ctx.fillStyle = PALETTE.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (path.length >= 2) {
        ctx.save();
        ctx.strokeStyle = PALETTE.pathLine;
        ctx.lineWidth   = cs * 0.48;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        ctx.moveTo(path[0].col * cs + cs / 2, path[0].row * cs + cs / 2);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].col * cs + cs / 2, path[i].row * cs + cs / 2);
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = PALETTE.pathFill;
      for (const { row, col } of path) {
        ctx.fillRect(col * cs + 1, row * cs + 1, cs - 2, cs - 2);
      }

      const r = Math.max(3, cs * 0.22);
      ctx.fillStyle = PALETTE.start;
      fillRoundRect(ctx, 3, 3, cs - 6, cs - 6, r);
      ctx.fillStyle = PALETTE.finish;
      fillRoundRect(ctx, (cols - 1) * cs + 3, (rows - 1) * cs + 3, cs - 6, cs - 6, r);

      const fs = Math.max(Math.floor(cs * 0.46), 11);
      ctx.font         = `bold ${fs}px 'Fredoka One', cursive`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillText('S', cs * 0.5 + 1, cs * 0.5 + 1);
      ctx.fillStyle = PALETTE.label;
      ctx.fillText('S', cs * 0.5, cs * 0.5);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillText('F', (cols - 0.5) * cs + 1, (rows - 0.5) * cs + 1);
      ctx.fillStyle = PALETTE.label;
      ctx.fillText('F', (cols - 0.5) * cs, (rows - 0.5) * cs);

      ctx.strokeStyle = PALETTE.wall;
      ctx.lineWidth   = Math.max(2, Math.round(cs * 0.09));
      ctx.lineCap     = 'butt';
      for (let rr = 0; rr < rows; rr++) {
        for (let c = 0; c < cols; c++) {
          const { walls } = grid[rr][c];
          const x = c * cs, y = rr * cs;
          ctx.beginPath();
          if (walls.top)    { ctx.moveTo(x,      y);      ctx.lineTo(x + cs, y);      }
          if (walls.right)  { ctx.moveTo(x + cs, y);      ctx.lineTo(x + cs, y + cs); }
          if (walls.bottom) { ctx.moveTo(x,      y + cs); ctx.lineTo(x + cs, y + cs); }
          if (walls.left)   { ctx.moveTo(x,      y);      ctx.lineTo(x,      y + cs); }
          ctx.stroke();
        }
      }

      if (path.length > 0 && !won) {
        const { row, col } = path[path.length - 1];
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        const pad = Math.max(2, cs * 0.18);
        fillRoundRect(ctx, col * cs + pad, row * cs + pad, cs - pad * 2, cs - pad * 2, Math.max(3, cs * 0.22));
      }
    };

    const resize = () => {
      computeSize();
      canvas.width  = cols * cellSize;
      canvas.height = rows * cellSize;
      draw();
    };

    const pxToCell = (x, y) => {
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
      return { row, col };
    };

    const canPass = (r1, c1, r2, c2) => {
      const dr = r2 - r1, dc = c2 - c1;
      if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
      if (dr === -1) return !grid[r1][c1].walls.top;
      if (dr ===  1) return !grid[r1][c1].walls.bottom;
      if (dc === -1) return !grid[r1][c1].walls.left;
      if (dc ===  1) return !grid[r1][c1].walls.right;
      return false;
    };

    const getPos = (e) => {
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const src    = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top)  * scaleY,
      };
    };

    const onDown = (e) => {
      if (won) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      const cell = pxToCell(x, y);
      if (!cell) return;

      const idx = path.findIndex(p => p.row === cell.row && p.col === cell.col);
      if (idx !== -1) {
        isDrawing = true;
        path = path.slice(0, idx + 1);
        draw();
        return;
      }

      if (cell.row === 0 && cell.col === 0) {
        isDrawing = true;
        if (!startTime) startTime = Date.now();
        path = [{ row: 0, col: 0 }];
        draw();
      }
    };

    const onMove = (e) => {
      if (!isDrawing || won) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      const cell = pxToCell(x, y);
      if (!cell) return;

      const last = path[path.length - 1];
      if (!last || (cell.row === last.row && cell.col === last.col)) return;

      const idx = path.findIndex(p => p.row === cell.row && p.col === cell.col);
      if (idx !== -1) {
        path = path.slice(0, idx + 1);
        draw();
        return;
      }

      if (canPass(last.row, last.col, cell.row, cell.col)) {
        path = [...path, { row: cell.row, col: cell.col }];
        if (cell.row === rows - 1 && cell.col === cols - 1) {
          won = true;
          const timeMs = startTime ? Date.now() - startTime : 0;
          draw();
          setTimeout(() => onWinRef.current?.(timeMs), 180);
        } else {
          draw();
        }
      }
    };

    const onUp = () => { isDrawing = false; };

    // Expose clear via imperative handle
    clearRef.current = () => {
      if (won) return;
      path = [];
      isDrawing = false;
      draw();
    };

    resize();

    canvas.addEventListener('mousedown',   onDown);
    canvas.addEventListener('mousemove',   onMove);
    canvas.addEventListener('mouseup',     onUp);
    canvas.addEventListener('mouseleave',  onUp);
    canvas.addEventListener('touchstart',  onDown,  { passive: false });
    canvas.addEventListener('touchmove',   onMove,  { passive: false });
    canvas.addEventListener('touchend',    onUp);
    canvas.addEventListener('touchcancel', onUp);
    window.addEventListener('resize',      resize);

    return () => {
      clearRef.current = null;
      canvas.removeEventListener('mousedown',   onDown);
      canvas.removeEventListener('mousemove',   onMove);
      canvas.removeEventListener('mouseup',     onUp);
      canvas.removeEventListener('mouseleave',  onUp);
      canvas.removeEventListener('touchstart',  onDown);
      canvas.removeEventListener('touchmove',   onMove);
      canvas.removeEventListener('touchend',    onUp);
      canvas.removeEventListener('touchcancel', onUp);
      window.removeEventListener('resize',      resize);
    };
  }, [grid, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', borderRadius: 10, touchAction: 'none', cursor: 'crosshair' }}
    />
  );
});

export default MazeCanvas;