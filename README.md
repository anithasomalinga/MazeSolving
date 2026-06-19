# 🌟 Maze Adventure!

A colorful, kid-friendly maze-solving game for ages 5–15. Supports both standalone play (single `index.html` PWA) and a full-stack mode with a daily challenge and global leaderboard.

---

## 📁 Project Structure

```
MazeSolving/
├── index.html                  # Standalone PWA (no backend needed)
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (offline caching)
├── icon.svg / icon-192.png / icon-512.png
├── docker-compose.yml          # Local Postgres for full-stack dev
│
├── backend/                    # Express + Prisma API
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── routes/
│   │   │   ├── maze.js         # GET /maze/daily
│   │   │   └── leaderboard.js  # GET/POST /leaderboard
│   │   └── services/
│   │       └── mazeGenerator.js # Seeded (deterministic) maze generation
│   ├── prisma/
│   │   └── schema.prisma       # Score model
│   └── .env.example
│
└── frontend/                   # React + Vite app
    └── src/
        ├── App.jsx             # Mode switcher, layout, state
        ├── components/
        │   ├── MazeCanvas.jsx  # Canvas game (mouse + touch)
        │   ├── Leaderboard.jsx # Today's top 10 (daily mode)
        │   └── WinModal.jsx    # Confetti + score submission
        ├── api/client.js       # Fetch wrappers for the API
        └── utils/mazeGenerator.js # Local random maze (free play)
```

---

## 🎮 How to Play

1. Choose a difficulty — **🐣 Easy** (9×9), **🦊 Medium** (13×13), or **🐉 Hard** (19×19)
2. **Click and drag** (or tap and drag on mobile) starting from the green **S** cell
3. Draw a path through open corridors to reach the gold **F** cell
4. You cannot pass through walls — only open corridors are valid
5. Dragging back over a visited cell trims the path back to that point
6. Lift and re-click any cell already in your path to **continue from there**
7. Reach **F** to win — confetti and a celebration modal appear!

---

## 🕹️ Controls

| Button | Action |
|--------|--------|
| 🐣 Easy / 🦊 Medium / 🐉 Hard | Switch difficulty and load a new maze |
| 🎲 New Maze | Fresh random maze at the current difficulty |
| 🧹 Clear | Erase your path (maze stays the same) — Free Play only |
| 🎮 Free Play | Random mazes, no timer, no leaderboard |
| 📅 Daily Challenge | Everyone gets the same maze today; submit your time |

---

## 🚀 Running the Full-Stack App

### Prerequisites
- Node.js 18+
- Docker (for Postgres) — or use the SQLite fallback below

### 1. Start the database

```bash
docker compose up -d
```

**No Docker?** Edit `backend/prisma/schema.prisma` and change the datasource provider to `"sqlite"`, then set `DATABASE_URL="file:./dev.db"` in `backend/.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL if needed
npm install
npm run db:migrate          # creates the Score table
npm run dev                 # API runs on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3001
npm install
npm run dev                 # App runs on http://localhost:5173
```

Open `http://localhost:5173` — Free Play works immediately. Switch to **Daily Challenge** to hit the backend.

---

## 🌐 API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/maze/daily?difficulty=medium` | Today's seeded maze (same for everyone) |
| `GET` | `/leaderboard?difficulty=medium&date=YYYY-MM-DD` | Top 10 scores |
| `POST` | `/leaderboard` | Submit a score `{ name, timeMs, difficulty, date }` |

The daily maze is generated from a **seeded PRNG (mulberry32)** keyed on today's date + difficulty, so every player receives an identical maze for that day.

---

## 🧩 Features

### Maze Generation
- **Recursive backtracking** (iterative DFS) — guaranteed perfect maze (one solution, no loops)
- Free Play: seeded with `Math.random()` — different every time
- Daily Challenge: seeded from the current date — identical for all players each day

### Daily Challenge & Leaderboard
- Server generates a consistent maze for each day/difficulty combination
- Timer starts on first drag from **S**, stops on reaching **F**
- Submit your name after winning to appear on the global top-10 leaderboard
- Leaderboard refreshes automatically after score submission

### Canvas & Rendering
- HTML5 `<canvas>` — no rendering library
- Cell size computed from `window.innerWidth`; re-renders on resize
- Drawing order: background → path line → path fills → start/finish → labels → walls

### Win Celebration
- Animated pop-in modal
- 160 confetti particles with gravity, rotation, and fade-out over ~4 seconds

### Responsive & Touch-Friendly
- Works on desktop (mouse) and mobile/tablet (touch)
- `touchstart`/`touchmove` with `passive: false` prevents scroll conflict

---

## 📱 Standalone PWA (no backend)

The original `index.html` is a self-contained PWA — no server required.

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

**Install on Android (Chrome):** three-dot menu → Add to Home screen  
**Install on iPhone/iPad (Safari):** Share → Add to Home Screen

The service worker caches all assets on first load; the game works fully offline after that.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Standalone frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| React frontend | React 18, Vite, inline styles |
| Backend | Node.js, Express |
| Database ORM | Prisma |
| Database | PostgreSQL (prod) / SQLite (local dev) |
| Rendering | HTML5 Canvas API |
| Fonts | Google Fonts — Fredoka One, Nunito |
| PWA | Web App Manifest + Service Worker |

---

## 🚀 Deployment

### Standalone (static)
| Platform | Steps |
|----------|-------|
| **GitHub Pages** | Enable Pages from repo Settings, serve from `main` root |
| **Netlify** | Drag project folder to [netlify.com/drop](https://app.netlify.com/drop) |

### Full-stack
| Layer | Platform |
|-------|----------|
| Frontend | Vercel / Netlify (set `VITE_API_URL` to your backend URL) |
| Backend | Render / Railway (free tier) |
| Database | Neon / Supabase (free tier Postgres) |

---

## 🎨 Design

| Element | Color |
|---------|-------|
| Background | Purple–indigo gradient (`#4f46e5` → `#7c3aed` → `#c026d3`) |
| Maze background | Soft lavender (`#fdf6ff`) |
| Walls | Deep indigo (`#2d1f6e`) |
| Start cell | Green (`#4ade80`) |
| Finish cell | Gold (`#fbbf24`) |
| Player path | Sky blue (`rgba(49, 130, 206, 0.65)`) |
| Fonts | [Fredoka One](https://fonts.google.com/specimen/Fredoka+One), [Nunito](https://fonts.google.com/specimen/Nunito) |
