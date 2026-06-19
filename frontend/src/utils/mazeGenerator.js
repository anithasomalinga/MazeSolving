const DIRS = [
  { dr: -1, dc: 0, wall: 'top',    opp: 'bottom' },
  { dr:  1, dc: 0, wall: 'bottom', opp: 'top'    },
  { dr:  0, dc: -1, wall: 'left',  opp: 'right'  },
  { dr:  0, dc:  1, wall: 'right', opp: 'left'   },
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateMaze(rows, cols) {
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