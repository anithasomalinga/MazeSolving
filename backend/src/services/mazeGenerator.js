'use strict';

// Deterministic PRNG — mulberry32
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// "2026-06-19" -> stable integer seed
function dateToSeed(dateStr) {
  return dateStr.split('-').reduce((acc, part) => acc * 10000 + parseInt(part, 10), 0);
}

const DIRS = [
  { dr: -1, dc: 0, wall: 'top', opp: 'bottom' },
  { dr: 1, dc: 0, wall: 'bottom', opp: 'top' },
  { dr: 0, dc: -1, wall: 'left', opp: 'right' },
  { dr: 0, dc: 1, wall: 'right', opp: 'left' },
];

function generateMaze(rows, cols, seed) {
  const rng = mulberry32(seed);

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const g = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      walls: { top: true, right: true, bottom: true, left: true },
    }))
  );

  const visited = Array.from({ length: rows }, () => new Uint8Array(cols));
  const stack = [{ r: 0, c: 0 }];
  visited[0][0] = 1;

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const dirs = shuffle(DIRS.slice());
    let moved = false;
    for (const d of dirs) {
      const nr = cur.r + d.dr;
      const nc = cur.c + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        g[cur.r][cur.c].walls[d.wall] = false;
        g[nr][nc].walls[d.opp] = false;
        visited[nr][nc] = 1;
        stack.push({ r: nr, c: nc });
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }

  return g;
}

module.exports = { generateMaze, dateToSeed };